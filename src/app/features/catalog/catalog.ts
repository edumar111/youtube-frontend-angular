import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../core/product.service';
import { CartService } from '../../core/cart.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-catalog',
  imports: [CurrencyPipe],
  template: `
    <section class="wrap">
      <h1>Catálogo</h1>
      @if (loading()) {
        <p class="muted">Cargando productos…</p>
      } @else if (error()) {
        <p class="error">No se pudo cargar el catálogo: {{ error() }}</p>
      } @else {
        <div class="grid">
          @for (p of products(); track p.id) {
            <article class="card">
              <h3>{{ p.name }}</h3>
              <p class="desc">{{ p.description }}</p>
              <p class="meta">Stock: {{ p.stock }} · {{ p.category?.name }}</p>
              <div class="row">
                <span class="price">{{ p.price | currency:'USD' }}</span>
                <button (click)="add(p)">Agregar</button>
              </div>
            </article>
          } @empty {
            <p class="muted">No hay productos.</p>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .wrap { max-width: 960px; margin: 0 auto; padding: 1.5rem 1.25rem; }
    h1 { color: #e8e8ec; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
    .card { background: #171826; border: 1px solid #262838; border-radius: 10px; padding: 1rem; color: #e8e8ec; }
    .card h3 { margin: 0 0 .4rem; color: #00e5ff; font-size: 1rem; }
    .desc { color: #b6b8c6; font-size: .85rem; min-height: 3.2em; }
    .meta { color: #7d8093; font-size: .8rem; }
    .row { display: flex; justify-content: space-between; align-items: center; margin-top: .6rem; }
    .price { color: #39ff88; font-weight: 700; }
    button { background: #ff7a1a; color: #10111a; border: none; padding: .4rem .8rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .muted { color: #7d8093; } .error { color: #ff3b5c; }
  `],
})
export class Catalog implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.productService.list().subscribe({
      next: (list) => { this.products.set(list); this.loading.set(false); },
      error: (e) => { this.error.set(e?.message ?? 'error'); this.loading.set(false); },
    });
  }

  add(p: Product): void {
    this.cart.add(p);
  }
}
