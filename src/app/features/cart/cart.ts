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
          <a class="btn btn-brand" routerLink="/catalog">Explorar catálogo</a>
        </div>
      } @else {
        <div class="panel">
          @for (item of cart.items(); track item.product.id) {
            <div class="line">
              <div class="info">
                <strong>{{ item.product.name }}</strong>
                <span class="muted">{{ item.product.price | currency:'USD' }} c/u</span>
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
          <div class="totals">
            <span class="muted">Total</span>
            <span class="grand">{{ cart.total() | currency:'USD' }}</span>
          </div>
          <div class="actions">
            <a class="btn btn-ghost" routerLink="/catalog">Seguir comprando</a>
            <a class="btn btn-accent" routerLink="/checkout">Ir a pagar →</a>
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .wrap { max-width: 820px; margin: 0 auto; padding: 2.2rem 1.5rem 3rem; }
    h1 { font-size: 2rem; margin: 0 0 1.4rem; }
    .empty { text-align: center; color: var(--muted); display: grid; gap: 1.1rem; justify-items: center; padding: 3rem 0; }
    .panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); box-shadow: var(--shadow-sm); overflow: hidden; }
    .line { display: grid; grid-template-columns: 1fr auto auto auto; align-items: center; gap: 1rem;
            padding: 1rem 1.2rem; border-bottom: 1px solid var(--border); }
    .line:last-child { border-bottom: none; }
    .info { display: flex; flex-direction: column; gap: .2rem; }
    .info strong { font-size: 1rem; }
    .muted { color: var(--muted); font-size: .85rem; }
    .qty { display: inline-flex; align-items: center; border: 1px solid var(--border-strong); border-radius: var(--r-pill); overflow: hidden; }
    .qty button { border: none; background: var(--surface-2); width: 34px; height: 34px; font-size: 1.1rem; color: var(--ink-soft); }
    .qty button:hover { background: var(--brand-050); color: var(--brand); }
    .qty input { width: 46px; text-align: center; border: none; font-family: var(--font-ui); font-size: .95rem; color: var(--ink); background: var(--surface); }
    .qty input:focus { outline: none; }
    .sub { font-weight: 700; color: var(--ink); min-width: 84px; text-align: right; }
    .del { border: none; background: transparent; color: var(--muted); font-size: 1rem; cursor: pointer; }
    .del:hover { color: var(--danger); }
    .summary { display: flex; justify-content: space-between; align-items: center; margin-top: 1.4rem; gap: 1rem; flex-wrap: wrap; }
    .totals { display: flex; align-items: baseline; gap: .6rem; }
    .grand { font-family: var(--font-display); font-weight: 700; font-size: 1.8rem; color: var(--brand); }
    .actions { display: flex; gap: .7rem; }
  `],
})
export class Cart {
  protected readonly cart = inject(CartService);

  onQty(productId: number, event: Event): void {
    this.cart.setQuantity(productId, Number((event.target as HTMLInputElement).value));
  }
}
