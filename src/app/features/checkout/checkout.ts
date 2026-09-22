import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { InvoiceService } from '../../core/invoice.service';
import { InvoiceRequest } from '../../core/models';

// Cliente demo sembrado por el backend (customer-service).
const DEMO_CUSTOMER_ID = 1;

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <section class="wrap">
      <h1>Checkout</h1>
      @if (cart.items().length === 0 && !invoiceId()) {
        <p class="muted">No hay nada que pagar. <a routerLink="/catalog">Ver catálogo</a>.</p>
      } @else if (!invoiceId()) {
        <p>Vas a comprar {{ cart.count() }} artículo(s) por
           <strong>{{ cart.total() | currency:'USD' }}</strong>.</p>
        <button class="pay" [disabled]="submitting()" (click)="pay()">
          {{ submitting() ? 'Procesando…' : 'Confirmar compra' }}
        </button>
      } @else {
        <div class="result">
          <p>Factura <strong>#{{ invoiceId() }}</strong> creada.</p>
          <p>Estado de la saga:
            <span class="state" [class.ok]="state()==='CONFIRMED'"
                  [class.bad]="state()==='CANCELLED'">{{ state() }}</span>
          </p>
          @if (state()==='PENDING') { <p class="muted">Esperando el descuento de stock (Outbox → Kafka → product-service)…</p> }
          @if (state()==='CONFIRMED') { <p class="ok">¡Compra confirmada! El stock se descontó correctamente.</p> }
          @if (state()==='CANCELLED') { <p class="bad">La compra se canceló (compensación de la saga: stock insuficiente u otro fallo).</p> }
          <a class="btn" routerLink="/catalog">Seguir comprando</a>
        </div>
      }
      @if (error()) { <p class="bad">Error: {{ error() }}</p> }
    </section>
  `,
  styles: [`
    .wrap { max-width: 620px; margin: 0 auto; padding: 1.5rem 1.25rem; color: #e8e8ec; }
    .pay, .btn { background: #ff7a1a; color: #10111a; border: none; padding: .6rem 1.1rem; border-radius: 6px; cursor: pointer; font-weight: 700; text-decoration: none; display: inline-block; }
    .pay[disabled] { opacity: .6; cursor: default; }
    .state { font-weight: 700; color: #00e5ff; } .state.ok { color: #39ff88; } .state.bad { color: #ff3b5c; }
    .ok { color: #39ff88; } .bad { color: #ff3b5c; } .muted { color: #7d8093; } a { color: #00e5ff; }
    .result { background: #171826; border: 1px solid #262838; border-radius: 10px; padding: 1rem; }
  `],
})
export class Checkout {
  protected readonly cart = inject(CartService);
  private readonly invoiceService = inject(InvoiceService);

  readonly submitting = signal(false);
  readonly invoiceId = signal<number | null>(null);
  readonly state = signal<string>('');
  readonly error = signal<string | null>(null);

  pay(): void {
    this.submitting.set(true);
    this.error.set(null);
    const request: InvoiceRequest = {
      numberInvoice: 'WEB-' + Date.now(),
      description: 'Compra desde la web',
      customerId: DEMO_CUSTOMER_ID,
      items: this.cart.items().map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        price: i.product.price,
      })),
    };
    this.invoiceService.create(request).subscribe({
      next: (inv) => {
        this.invoiceId.set(inv.id);
        this.state.set(inv.state);
        this.cart.clear();
        this.submitting.set(false);
        this.poll(inv.id, 0);
      },
      error: (e) => { this.error.set(e?.message ?? 'error'); this.submitting.set(false); },
    });
  }

  /** Ep. 7 — sondea el estado hasta que la saga confirme o cancele (o se agoten los intentos). */
  private poll(id: number, attempt: number): void {
    if (attempt >= 10 || this.state() !== 'PENDING') {
      return;
    }
    setTimeout(() => {
      this.invoiceService.get(id).subscribe({
        next: (inv) => {
          this.state.set(inv.state);
          this.poll(id, attempt + 1);
        },
        error: () => this.poll(id, attempt + 1),
      });
    }, 1500);
  }
}
