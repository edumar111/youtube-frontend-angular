import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <section class="wrap">
      <h1>Carrito</h1>
      @if (cart.items().length === 0) {
        <p class="muted">Tu carrito está vacío. <a routerLink="/catalog">Ver catálogo</a>.</p>
      } @else {
        <table>
          <thead>
            <tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr>
          </thead>
          <tbody>
            @for (item of cart.items(); track item.product.id) {
              <tr>
                <td>{{ item.product.name }}</td>
                <td>{{ item.product.price | currency:'USD' }}</td>
                <td>
                  <input type="number" min="1" [value]="item.quantity"
                         (change)="onQty(item.product.id, $event)" />
                </td>
                <td>{{ item.product.price * item.quantity | currency:'USD' }}</td>
                <td><button class="del" (click)="cart.remove(item.product.id)">✕</button></td>
              </tr>
            }
          </tbody>
        </table>
        <div class="foot">
          <strong>Total: {{ cart.total() | currency:'USD' }}</strong>
          <a class="btn" routerLink="/checkout">Ir a pagar</a>
        </div>
      }
    </section>
  `,
  styles: [`
    .wrap { max-width: 760px; margin: 0 auto; padding: 1.5rem 1.25rem; color: #e8e8ec; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: .5rem; border-bottom: 1px solid #262838; }
    input { width: 64px; background: #12131a; color: #e8e8ec; border: 1px solid #3a3d52; border-radius: 6px; padding: .3rem; }
    .foot { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; }
    .btn { background: #ff7a1a; color: #10111a; padding: .5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: 600; }
    .del { background: transparent; color: #ff3b5c; border: none; cursor: pointer; font-size: 1rem; }
    .muted { color: #7d8093; } a { color: #00e5ff; }
  `],
})
export class Cart {
  protected readonly cart = inject(CartService);

  onQty(productId: number, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.cart.setQuantity(productId, value);
  }
}
