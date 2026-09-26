import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { InvoiceService } from '../../core/invoice.service';
import { InvoiceRequest } from '../../core/models';

const DEMO_CUSTOMER_ID = 1;

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <section class="wrap">
      <h1>Finalizar compra</h1>

      @if (cart.items().length === 0 && !invoiceId()) {
        <div class="empty">
          <p>No hay nada que pagar.</p>
          <a class="btn btn-primary" routerLink="/catalog">Ver catálogo</a>
        </div>
      } @else if (!invoiceId()) {
        <div class="panel">
          <h2>Resumen del pedido</h2>
          @for (item of cart.items(); track item.product.id) {
            <div class="item">
              <div class="thumb">
                @if (item.product.imageUrl) {
                  <img [src]="item.product.imageUrl" [alt]="item.product.name"
                       (error)="$any($event.target).style.display='none'" />
                } @else { {{ ini(item.product.name) }} }
              </div>
              <div class="info">
                <span class="name">{{ item.product.name }}</span>
                <span class="q">Cantidad: {{ item.quantity }}</span>
              </div>
              <span class="sub">{{ item.product.price * item.quantity | currency:'USD' }}</span>
            </div>
          }
          <div class="row ship"><span>Envío</span><span class="free">GRATIS</span></div>
          <div class="row total"><span>Total</span><span class="grand">{{ cart.total() | currency:'USD' }}</span></div>
          <button class="btn btn-primary lg" [disabled]="submitting()" (click)="pay()">
            {{ submitting() ? 'Procesando…' : 'Hacer pedido' }}
          </button>
          <p class="safe">🔒 Pago seguro · Garantía de devolución</p>
        </div>
      } @else {
        <div class="panel result">
          <p class="fnum">Pedido #{{ invoiceId() }}</p>
          <div class="statebox">
            <span class="label">Estado del pedido</span>
            <span class="badge" [class.pending]="state()==='PENDING'" [class.ok]="state()==='CONFIRMED'" [class.bad]="state()==='CANCELLED'">
              @if (state()==='PENDING') { <span class="spin"></span> } {{ state() }}
            </span>
          </div>
          @if (state()==='PENDING') { <p class="muted">Confirmando tu pedido (descuento de stock)…</p> }
          @if (state()==='CONFIRMED') { <p class="ok">¡Pedido confirmado! Gracias por tu compra.</p> }
          @if (state()==='CANCELLED') { <p class="bad">El pedido se canceló (stock insuficiente u otro fallo).</p> }
          <a class="btn btn-primary" routerLink="/catalog">Seguir comprando</a>
        </div>
      }
      @if (error()) { <p class="bad">Error: {{ error() }}</p> }
    </section>
  `,
  styles: [`
    .wrap { max-width: 560px; margin: 0 auto; padding: 1.6rem 1.25rem 3rem; }
    h1 { font-size: 1.7rem; margin: 0 0 1.2rem; }
    h2 { font-size: 1.05rem; margin: 0 0 .9rem; }
    .panel { background: #fff; border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--shadow); padding: 1.3rem; }
    .item { display: grid; grid-template-columns: 48px 1fr auto; align-items: center; gap: .8rem;
            padding: .7rem 0; border-bottom: 1px solid var(--border); }
    .item .thumb { width: 48px; height: 48px; border-radius: var(--r-sm); background: var(--surface-2);
                   color: var(--primary); display: grid; place-items: center; font-weight: 800; overflow: hidden; }
    .item .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .item .info { display: flex; flex-direction: column; gap: .15rem; min-width: 0; }
    .item .name { font-size: .9rem; font-weight: 600; color: var(--ink); line-height: 1.3;
                  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .item .q { font-size: .8rem; color: var(--muted); }
    .item .sub { font-weight: 800; color: var(--sale); white-space: nowrap; }
    .row { display: flex; justify-content: space-between; padding: .5rem 0; border-bottom: 1px solid var(--border); color: var(--ink); }
    .row .mono { font-variant-numeric: tabular-nums; color: var(--muted); }
    .row.ship { padding-top: .8rem; }
    .row.ship .free { color: var(--success); font-weight: 800; }
    .row.total { border-bottom: none; margin-top: .3rem; padding-top: .8rem; font-weight: 800; }
    .grand { color: var(--sale); font-size: 1.5rem; font-weight: 800; }
    .btn.lg { width: 100%; margin-top: 1.1rem; padding: .85rem; font-size: 1rem; }
    .safe { text-align: center; color: var(--muted); font-size: .8rem; margin: .7rem 0 0; }
    .empty { text-align: center; color: var(--muted); display: grid; gap: 1.1rem; justify-items: center; padding: 3rem 0; }

    .result { text-align: center; }
    .fnum { font-size: 1.15rem; font-weight: 800; margin: 0 0 1rem; }
    .statebox { display: flex; flex-direction: column; align-items: center; gap: .5rem; margin: .3rem 0 1rem; }
    .label { text-transform: uppercase; letter-spacing: .1em; font-size: .72rem; color: var(--muted); font-weight: 700; }
    .badge { display: inline-flex; align-items: center; gap: .5rem; font-weight: 800; font-size: 1.05rem; padding: .5rem 1.1rem; border-radius: var(--r-pill); }
    .badge.pending { background: var(--primary-050); color: var(--primary); }
    .badge.ok { background: #e7f6e7; color: var(--success); }
    .badge.bad { background: var(--sale-050); color: var(--sale); }
    .spin { width: 14px; height: 14px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: sp .7s linear infinite; }
    @keyframes sp { to { transform: rotate(360deg); } }
    .muted { color: var(--muted); } .ok { color: var(--success); } .bad { color: var(--sale); }
    .result .btn { margin-top: .6rem; }
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
      items: this.cart.items().map((i) => ({ productId: i.product.id, quantity: i.quantity, price: i.product.price })),
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

  ini(name: string): string {
    return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  private poll(id: number, attempt: number): void {
    if (attempt >= 10 || this.state() !== 'PENDING') { return; }
    setTimeout(() => {
      this.invoiceService.get(id).subscribe({
        next: (inv) => { this.state.set(inv.state); this.poll(id, attempt + 1); },
        error: () => this.poll(id, attempt + 1),
      });
    }, 1500);
  }
}
