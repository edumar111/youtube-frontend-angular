import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="bar">
      <div class="inner">
        <a routerLink="/catalog" class="brand">Online<span>Store</span></a>

        <nav>
          <a routerLink="/catalog" routerLinkActive="active">Catálogo</a>
          <a routerLink="/cart" routerLinkActive="active" class="cart-link">
            Carrito
            @if (cart.count() > 0) { <span class="badge">{{ cart.count() }}</span> }
          </a>
        </nav>

        <div class="right">
          @if (auth.loggedIn()) {
            <span class="user">Hola, {{ auth.userName }}</span>
            <button class="btn btn-secondary sm" (click)="auth.logout()">Salir</button>
          } @else {
            <button class="btn btn-primary sm" (click)="auth.login()">Iniciar sesión</button>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .bar { position: sticky; top: 0; z-index: 50; background: #fff; border-bottom: 1px solid var(--border); }
    .inner { max-width: var(--maxw); margin: 0 auto; height: 64px; padding: 0 1.25rem;
             display: flex; align-items: center; gap: 1.5rem; }
    .brand { font-size: 1.5rem; font-weight: 800; color: var(--primary); letter-spacing: -.02em; }
    .brand span { color: var(--ink); }
    nav { display: flex; gap: 1.3rem; }
    nav a { color: var(--ink); font-weight: 600; font-size: .95rem; position: relative; padding: .2rem 0; }
    nav a.active { color: var(--primary); }
    nav a.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: -4px; height: 2px; background: var(--primary); border-radius: 2px; }
    .cart-link { display: inline-flex; align-items: center; gap: .4rem; }
    .badge { background: var(--primary); color: #fff; font-size: .72rem; font-weight: 700; min-width: 20px; height: 20px;
             padding: 0 6px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; }
    .right { margin-left: auto; display: flex; align-items: center; gap: .8rem; }
    .user { color: var(--muted); font-size: .9rem; font-weight: 600; }
    .btn.sm { padding: .45rem .95rem; font-size: .85rem; }
    @media (max-width: 560px) { .inner { gap: 1rem; padding: 0 1rem; } .brand { font-size: 1.3rem; } .user { display: none; } }
  `],
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
}
