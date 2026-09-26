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
        <div class="empty">
          <p>No hay nada que pagar.</p>
          <a class="btn btn-brand" routerLink="/catalog">Ver catálogo</a>
        </div>
      } @else if (!invoiceId()) {
        <div class="panel">
          <h2>Resumen del pedido</h2>
          @for (item of cart.items(); track item.product.id) {
            <div class="row">
              <span>{{ item.quantity }} × {{ item.product.name }}</span>
              <span class="mono">{{ item.product.price * item.quantity | currency:'USD' }}</span>
            </div>
          }
          <div class="row total">
            <span>Total</span><span class="grand">{{ cart.total() | currency:'USD' }}</span>
          </div>
          <button class="btn btn-accent lg" [disabled]="submitting()" (click)="pay()">
            {{ submitting() ? 'Procesando…' : 'Confirmar compra' }}
          </button>
        </div>
      } @else {
        <div class="panel result">
          <p class="fnum">Factura #{{ invoiceId() }}</p>
          <div class="statebox">
            <span class="label">Estado de la saga</span>
            <span class="badge"
                  [class.pending]="state()==='PENDING'"
                  [class.ok]="state()==='CONFIRMED'"
                  [class.bad]="state()==='CANCELLED'">
              @if (state()==='PENDING') { <span class="spin"></span> }
              {{ state() }}
            </span>
          </div>
          @if (state()==='PENDING') { <p class="muted">Descontando stock (Outbox → Kafka → product-service)…</p> }
          @if (state()==='CONFIRMED') { <p class="ok">¡Compra confirmada! El stock se descontó correctamente.</p> }
          @if (state()==='CANCELLED') { <p class="bad">Compra cancelada (compensación de la saga: stock insuficiente u otro fallo).</p> }
          <a class="btn btn-brand" routerLink="/catalog">Seguir comprando</a>
        </div>
      }
      @if (error()) { <p class="bad">Error: {{ error() }}</p> }
    </section>
  `,
  styles: [`
    .wrap { max-width: 560px; margin: 0 auto; padding: 2.2rem 1.5rem 3rem; }
    h1 { font-size: 2rem; margin: 0 0 1.4rem; }
    h2 { font-size: 1.15rem; margin: 0 0 1rem; }
    .panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); box-shadow: var(--shadow); padding: 1.5rem; }
    .row { display: flex; justify-content: space-between; padding: .5rem 0; border-bottom: 1px dashed var(--border); color: var(--ink-soft); }
    .row.total { border-bottom: none; border-top: 2px solid var(--border-strong); margin-top: .4rem; padding-top: .9rem; color: var(--ink); font-weight: 700; }
    .mono { font-variant-numeric: tabular-nums; }
    .grand { font-family: var(--font-display); font-weight: 700; font-size: 1.5rem; color: var(--brand); }
    .btn.lg { width: 100%; margin-top: 1.3rem; padding: .85rem; font-size: 1rem; }
    .empty { text-align: center; color: var(--muted); display: grid; gap: 1.1rem; justify-items: center; padding: 3rem 0; }

    .result { text-align: center; }
    .fnum { font-family: var(--font-display); font-size: 1.3rem; color: var(--ink); margin: 0 0 1rem; }
    .statebox { display: flex; flex-direction: column; align-items: center; gap: .5rem; margin: .5rem 0 1rem; }
    .label { text-transform: uppercase; letter-spacing: .14em; font-size: .72rem; color: var(--muted); font-weight: 700; }
    .badge { display: inline-flex; align-items: center; gap: .5rem; font-weight: 700; font-size: 1.05rem;
             padding: .5rem 1.1rem; border-radius: var(--r-pill); }
    .badge.pending { background: #fff5e6; color: #a9611a; }
    .badge.ok { background: #e6f6ed; color: #157a43; }
    .badge.bad { background: #fdeceb; color: var(--danger); }
    .spin { width: 14px; height: 14px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: sp .7s linear infinite; }
    @keyframes sp { to { transform: rotate(360deg); } }
    .muted { color: var(--muted); } .ok { color: var(--success); } .bad { color: var(--danger); }
    .result .btn { margin-top: .8rem; }
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
        next: (inv) => { this.state.set(inv.state); this.poll(id, attempt + 1); },
        error: () => this.poll(id, attempt + 1),
      });
    }, 1500);
  }
}
