import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <section class="wrap">
      <h1>Tu carrito</h1>

      @if (cart.items().length === 0) {
        <div class="empty">
          <p>Tu carrito está vacío.</p>
          <a class="btn btn-primary" routerLink="/catalog">Explorar catálogo</a>
        </div>
      } @else {
        <div class="panel">
          @for (item of cart.items(); track item.product.id) {
            <div class="line">
              <div class="glyph">{{ ini(item.product.name) }}</div>
              <div class="info">
                <strong>{{ item.product.name }}</strong>
                <span class="badge-free">✓ Envío gratis</span>
              </div>
              <div class="qty">
                <button (click)="cart.setQuantity(item.product.id, item.quantity - 1)" aria-label="Menos">−</button>
                <input type="number" min="1" [value]="item.quantity" (change)="onQty(item.product.id, $event)" />
                <button (click)="cart.setQuantity(item.product.id, item.quantity + 1)" aria-label="Más">+</button>
              </div>
              <div class="sub">{{ item.product.price * item.quantity | currency:'USD' }}</div>
              <button class="del" (click)="cart.remove(item.product.id)" aria-label="Quitar">✕</button>
            </div>
          }
        </div>

        <div class="summary">
          <span class="ship">✓ Tu pedido califica para envío gratis</span>
          <div class="totals">
            <div class="tot"><span class="muted">Total</span> <span class="grand">{{ cart.total() | currency:'USD' }}</span></div>
            <div class="actions">
              <a class="btn btn-secondary" routerLink="/catalog">Seguir comprando</a>
              <a class="btn btn-primary" routerLink="/checkout">Ir a pagar →</a>
            </div>
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .wrap { max-width: 860px; margin: 0 auto; padding: 1.6rem 1.25rem 3rem; }
    h1 { font-size: 1.7rem; margin: 0 0 1.2rem; }
    .empty { text-align: center; color: var(--muted); display: grid; gap: 1.1rem; justify-items: center; padding: 3rem 0; }
    .panel { background: #fff; border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--shadow-sm); overflow: hidden; }
    .line { display: grid; grid-template-columns: 48px 1fr auto auto auto; align-items: center; gap: 1rem;
            padding: .9rem 1rem; border-bottom: 1px solid var(--border); }
    .line:last-child { border-bottom: none; }
    .glyph { width: 48px; height: 48px; border-radius: var(--r-sm); background: var(--surface-2); color: var(--primary);
             display: grid; place-items: center; font-weight: 800; }
    .info { display: flex; flex-direction: column; gap: .3rem; }
    .info strong { font-size: .95rem; font-weight: 600; }
    .badge-free { align-self: flex-start; }
    .qty { display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: var(--r-pill); overflow: hidden; }
    .qty button { border: none; background: var(--surface-2); width: 32px; height: 32px; font-size: 1.05rem; color: var(--ink); }
    .qty button:hover { background: var(--primary-050); color: var(--primary); }
    .qty input { width: 42px; text-align: center; border: none; font-family: var(--font-ui); font-size: .92rem; color: var(--ink); }
    .qty input:focus { outline: none; }
    .sub { font-weight: 800; color: var(--sale); min-width: 84px; text-align: right; }
    .del { border: none; background: transparent; color: var(--muted); font-size: 1rem; }
    .del:hover { color: var(--sale); }
    .summary { margin-top: 1.2rem; background: #fff; border: 1px solid var(--border); border-radius: var(--r); padding: 1.1rem 1.2rem; }
    .ship { color: var(--success); font-weight: 700; font-size: .9rem; }
    .totals { display: flex; justify-content: space-between; align-items: center; margin-top: .8rem; gap: 1rem; flex-wrap: wrap; }
    .tot { display: flex; align-items: baseline; gap: .5rem; }
    .muted { color: var(--muted); }
    .grand { font-weight: 800; font-size: 1.6rem; color: var(--sale); }
    .actions { display: flex; gap: .7rem; }
  `],
})
export class Cart {
  protected readonly cart = inject(CartService);
  onQty(productId: number, event: Event): void {
    this.cart.setQuantity(productId, Number((event.target as HTMLInputElement).value));
  }
  ini(name: string): string { return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase(); }
}
