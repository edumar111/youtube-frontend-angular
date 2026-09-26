import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../core/product.service';
import { CartService } from '../../core/cart.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-catalog',
  imports: [CurrencyPipe],
  template: `
    <div class="promo">🔥 Envío gratis en tu primer pedido · Ofertas por tiempo limitado</div>

    <section class="topbar">
      <div class="search">
        <svg viewBox="0 0 24 24" class="ic" aria-hidden="true">
          <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            d="M21 21l-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/>
        </svg>
        <input type="search" [value]="query()" (input)="onSearch($event)"
               placeholder="Buscar productos…" aria-label="Buscar" />
        @if (query()) { <button class="clear" (click)="clear()" aria-label="Limpiar">✕</button> }
      </div>
    </section>

    <section class="wrap">
      @if (loading()) {
        <div class="grid">
          @for (n of [1,2,3,4,5,6,7,8]; track n) { <div class="card skeleton"></div> }
        </div>
      } @else if (error()) {
        <p class="error">No se pudo cargar el catálogo: {{ error() }}</p>
      } @else {
        <div class="count">{{ filtered().length }} resultado(s)@if (query()) { <span> para “{{ query() }}”</span> }</div>
        <div class="grid">
          @for (p of filtered(); track p.id; let i = $index) {
            <article class="card" [style.animation-delay.ms]="i * 35">
              <div class="thumb">
                <span class="glyph" [style.color]="tint(p)">{{ initials(p.name) }}</span>
                @if (p.stock <= 3) { <span class="hot badge-hot">¡Casi agotado!</span> }
              </div>
              <div class="body">
                <h3>{{ p.name }}</h3>
                <span class="badge-free">✓ Envío gratis</span>
                <div class="pricing">
                  <span class="price">{{ p.price | currency:'USD' }}</span>
                  <span class="unit">/ unidad</span>
                </div>
                <div class="foot">
                  <span class="stockline" [class.low]="p.stock <= 3">{{ p.stock }} disp.</span>
                  <button class="btn btn-primary sm" (click)="add(p)">
                    {{ added() === p.id ? '✓ Añadido' : 'Agregar' }}
                  </button>
                </div>
              </div>
            </article>
          } @empty {
            <div class="empty">
              <p>Sin resultados para “{{ query() }}”.</p>
              <button class="btn btn-secondary" (click)="clear()">Ver todo</button>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .promo { background: var(--primary); color: #fff; text-align: center; font-weight: 700;
             font-size: .86rem; padding: .5rem 1rem; }
    .topbar { background: #fff; border-bottom: 1px solid var(--border); padding: .9rem 1.25rem; position: sticky; top: 64px; z-index: 20; }
    .search { position: relative; max-width: 640px; margin: 0 auto; }
    .search .ic { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: var(--muted); }
    .search input { width: 100%; font-family: var(--font-ui); font-size: .98rem; color: var(--ink);
      background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-pill);
      padding: .72rem 2.4rem; }
    .search input:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(255,102,0,.12); }
    .clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); border: none;
      background: var(--border); color: var(--ink); width: 24px; height: 24px; border-radius: 50%; }

    .wrap { max-width: var(--maxw); margin: 0 auto; padding: 1.1rem 1.25rem 3rem; }
    .count { color: var(--muted); font-size: .88rem; font-weight: 600; margin: .3rem 0 1rem; }
    .count span { color: var(--ink); }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .card { background: #fff; border: 1px solid var(--border); border-radius: var(--r); overflow: hidden;
      box-shadow: var(--shadow-sm); display: flex; flex-direction: column; animation: rise .4s ease both;
      transition: box-shadow .16s ease, transform .16s ease; }
    .card:hover { box-shadow: var(--shadow-lg); transform: translateY(-3px); }
    .thumb { position: relative; aspect-ratio: 1 / 1; background: var(--surface-2); display: grid; place-items: center; }
    .glyph { font-size: 2.6rem; font-weight: 800; opacity: .9; }
    .hot { position: absolute; top: 8px; left: 8px; }
    .body { padding: .7rem .8rem .85rem; display: flex; flex-direction: column; gap: .4rem; flex: 1; }
    .body h3 { margin: 0; font-size: .92rem; font-weight: 600; line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.4em; }
    .badge-free { align-self: flex-start; }
    .pricing { display: flex; align-items: baseline; gap: .35rem; margin-top: .1rem; }
    .price { color: var(--sale); font-weight: 800; font-size: 1.25rem; }
    .unit { color: var(--muted); font-size: .76rem; }
    .foot { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: .5rem; }
    .stockline { color: var(--muted); font-size: .78rem; }
    .stockline.low { color: var(--sale); font-weight: 700; }
    .btn.sm { padding: .45rem .9rem; font-size: .82rem; }

    .skeleton { aspect-ratio: auto; height: 280px; border: 1px solid var(--border);
      background: linear-gradient(100deg, #f5f5f5 30%, #ececec 50%, #f5f5f5 70%); background-size: 200% 100%; animation: sk 1.2s infinite; }
    @keyframes sk { to { background-position: -200% 0; } }
    .empty { grid-column: 1 / -1; text-align: center; color: var(--muted); padding: 3rem 0; display: grid; gap: 1rem; justify-items: center; }
    .error { color: var(--sale); }
  `],
})
export class Catalog implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly query = signal('');
  readonly added = signal<number | null>(null);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.products().filter((p) => p.status !== 'DELETED');
    if (!q) return list;
    return list.filter((p) =>
      p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.productService.list().subscribe({
      next: (list) => { this.products.set(list); this.loading.set(false); },
      error: (e) => { this.error.set(e?.message ?? 'error'); this.loading.set(false); },
    });
  }

  onSearch(event: Event): void { this.query.set((event.target as HTMLInputElement).value); }
  clear(): void { this.query.set(''); }

  add(p: Product): void {
    this.cart.add(p);
    this.added.set(p.id);
    setTimeout(() => { if (this.added() === p.id) this.added.set(null); }, 1200);
  }

  /** Color estable del glifo por categoría (placeholder sobre fondo gris claro estilo Temu). */
  tint(p: Product): string {
    const hues = [22, 200, 275, 145, 330, 45];
    const key = p.category?.id ?? p.id;
    return `hsl(${hues[key % hues.length]} 70% 45%)`;
  }

  initials(name: string): string {
    return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }
}
