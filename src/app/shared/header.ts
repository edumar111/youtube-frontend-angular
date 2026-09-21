import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="bar">
      <a routerLink="/catalog" class="brand">🛒 Online Store</a>
      <nav>
        <a routerLink="/catalog" routerLinkActive="active">Catálogo</a>
        <a routerLink="/cart" routerLinkActive="active">Carrito ({{ cart.count() }})</a>
      </nav>
      <span class="spacer"></span>
      @if (auth.loggedIn()) {
        <span class="user">{{ auth.userName }}</span>
        <button (click)="auth.logout()">Salir</button>
      } @else {
        <button class="primary" (click)="auth.login()">Iniciar sesión</button>
      }
    </header>
  `,
  styles: [`
    .bar { display: flex; align-items: center; gap: 1rem; padding: .75rem 1.25rem;
           background: #12131a; color: #e8e8ec; border-bottom: 1px solid #262838; }
    .brand { font-weight: 700; color: #ff7a1a; text-decoration: none; font-size: 1.1rem; }
    nav { display: flex; gap: 1rem; }
    nav a { color: #c9cbd6; text-decoration: none; }
    nav a.active { color: #00e5ff; }
    .spacer { flex: 1; }
    .user { color: #39ff88; font-size: .9rem; }
    button { background: #262838; color: #e8e8ec; border: 1px solid #3a3d52;
             padding: .4rem .8rem; border-radius: 6px; cursor: pointer; }
    button.primary { background: #ff7a1a; color: #10111a; border: none; font-weight: 600; }
  `],
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
}
