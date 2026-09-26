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
        <a routerLink="/catalog" class="brand">
          <span class="mark">◆</span> Aurora<span class="brand-alt">Store</span>
        </a>

        <nav>
          <a routerLink="/catalog" routerLinkActive="active">Catálogo</a>
          <a routerLink="/cart" routerLinkActive="active" class="cart-link">
            Carrito
            @if (cart.count() > 0) { <span class="badge">{{ cart.count() }}</span> }
          </a>
        </nav>

        <div class="right">
          @if (auth.loggedIn()) {
            <span class="user"><span class="dot"></span>{{ auth.userName }}</span>
            <button class="btn btn-ghost sm" (click)="auth.logout()">Salir</button>
          } @else {
            <button class="btn btn-brand sm" (click)="auth.login()">Iniciar sesión</button>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .bar {
      position: sticky; top: 0; z-index: 50;
      background: rgba(255, 255, 255, .82);
      backdrop-filter: saturate(140%) blur(10px);
      border-bottom: 1px solid var(--border);
    }
    .inner {
      max-width: var(--maxw); margin: 0 auto; height: 68px; padding: 0 1.5rem;
      display: flex; align-items: center; gap: 1.5rem;
    }
    .brand {
      font-family: var(--font-display); font-weight: 700; font-size: 1.5rem;
      color: var(--ink); letter-spacing: -.02em; display: flex; align-items: center; gap: .5rem;
    }
    .brand:hover { color: var(--ink); }
    .brand .mark { color: var(--accent); font-size: 1.1rem; }
    .brand-alt { color: var(--brand); }
    nav { display: flex; gap: 1.4rem; margin-left: .5rem; }
    nav a {
      color: var(--ink-soft); font-weight: 600; font-size: .95rem; position: relative;
      padding: .25rem 0;
    }
    nav a.active { color: var(--brand); }
    nav a.active::after {
      content: ''; position: absolute; left: 0; right: 0; bottom: -6px; height: 2px;
      background: var(--brand); border-radius: 2px;
    }
    .cart-link { display: inline-flex; align-items: center; gap: .4rem; }
    .badge {
      background: var(--accent); color: #fff; font-size: .72rem; font-weight: 700;
      min-width: 20px; height: 20px; padding: 0 6px; border-radius: var(--r-pill);
      display: inline-flex; align-items: center; justify-content: center;
    }
    .right { margin-left: auto; display: flex; align-items: center; gap: .8rem; }
    .user { color: var(--ink-soft); font-size: .9rem; font-weight: 600; display: inline-flex; align-items: center; gap: .45rem; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--success); box-shadow: 0 0 0 3px rgba(31,157,87,.15); }
    .btn.sm { padding: .45rem .9rem; font-size: .86rem; }
    @media (max-width: 560px) {
      .brand { font-size: 1.25rem; } .inner { gap: 1rem; padding: 0 1rem; } nav { gap: 1rem; }
    }
  `],
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
}
