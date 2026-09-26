import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../core/product.service';
import { CartService } from '../../core/cart.service';
import { Category, Product } from '../../core/models';
import { Icon } from '../../shared/icon';
import { CategorySidebar } from './category-sidebar';

@Component({
  selector: 'app-catalog',
  imports: [CurrencyPipe, Icon, CategorySidebar],
  template: `
    <div class="promo"><app-icon name="flame" [size]="16" /> Envío gratis en tu primer pedido · Ofertas por tiempo limitado</div>

    <section class="topbar">
      <div class="search">
        <app-icon name="search" [size]="20" />
        <input type="search" [value]="query()" (input)="onSearch($event)" placeholder="Buscar productos…" aria-label="Buscar" />
        @if (query()) { <button class="clear" (click)="clear()" aria-label="Limpiar">✕</button> }
      </div>
    </section>

    <section class="wrap">
      <div class="layout">
        <app-category-sidebar [categories]="categories()" [selected]="selectedCategory()" />

        <div class="main">
          @if (loading()) {
            <div class="grid">@for (n of [1,2,3,4,5,6]; track n) { <div class="card skeleton"></div> }</div>
          } @else if (error()) {
            <p class="error">No se pudo cargar el catálogo: {{ error() }}</p>
          } @else {
            <div class="count">
              {{ filtered().length }} resultado(s)
              @if (activeName()) { <span> en {{ activeName() }}</span> }
              @if (query()) { <span> para “{{ query() }}”</span> }
            </div>
            <div class="grid">
              @for (p of filtered(); track p.id; let i = $index) {
                <article class="card" [style.animation-delay.ms]="i * 35">
                  <div class="thumb">
                    <span class="glyph" [style.color]="tint(p)">{{ initials(p.name) }}</span>
                    @if (p.imageUrl) {
                      <img class="photo" [src]="p.imageUrl" [alt]="p.name" loading="lazy"
                           (error)="$any($event.target).style.display='none'" />
                    }
                    @if (p.stock <= 3) { <span class="hot badge-hot">¡Casi agotado!</span> }
                  </div>
                  <div class="body">
                    <h3>{{ p.name }}</h3>
                    <span class="badge-free"><app-icon name="truck" [size]="14" /> Envío gratis</span>
                    <div class="pricing"><span class="price">{{ p.price | currency:'USD' }}</span><span class="unit">/ u</span></div>
                    <div class="foot">
                      <span class="stockline" [class.low]="p.stock <= 3">{{ p.stock }} disp.</span>
                      <button class="btn btn-primary sm" (click)="add(p)">
                        {{ added() === p.id ? '✓ Añadido' : 'Agregar' }}
                      </button>
                    </div>
                  </div>
                </article>
              } @empty {
                <div class="empty"><p>Sin resultados.</p><button class="btn btn-secondary" (click)="clear()">Ver todo</button></div>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .promo { background: var(--primary); color: #fff; text-align: center; font-weight: 700; font-size: .86rem;
             padding: .5rem 1rem; display: flex; align-items: center; justify-content: center; gap: .5rem; }
    .topbar { background: #fff; border-bottom: 1px solid var(--border); padding: .8rem 1.25rem; position: sticky; top: 64px; z-index: 20; }
    .search { position: relative; max-width: 680px; margin: 0 auto; display: flex; align-items: center; }
    .search app-icon { position: absolute; left: 14px; color: var(--muted); display: flex; }
    .search input { width: 100%; font-family: var(--font-ui); font-size: .98rem; color: var(--ink);
      background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--r-pill); padding: .72rem 2.4rem; }
    .search input:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(255,102,0,.12); }
    .clear { position: absolute; right: 10px; border: none; background: var(--border); color: var(--ink); width: 24px; height: 24px; border-radius: 50%; }

    .wrap { max-width: var(--maxw); margin: 0 auto; padding: 1.1rem 1.25rem 3rem; }
    .layout { display: grid; grid-template-columns: 220px 1fr; gap: 1.2rem; align-items: start; }
    .count { color: var(--muted); font-size: .88rem; font-weight: 600; margin: .2rem 0 1rem; }
    .count span { color: var(--ink); text-transform: capitalize; }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 1rem; }
    .card { background: #fff; border: 1px solid var(--border); border-radius: var(--r); overflow: hidden;
      box-shadow: var(--shadow-sm); display: flex; flex-direction: column; animation: rise .4s ease both;
      transition: box-shadow .16s ease, transform .16s ease; }
    .card:hover { box-shadow: var(--shadow-lg); transform: translateY(-3px); }
    .thumb { position: relative; aspect-ratio: 1 / 1; background: var(--surface-2); display: grid; place-items: center; overflow: hidden; }
    .glyph { font-size: 2.4rem; font-weight: 800; opacity: .9; }
    .photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; background: #fff; }
    .hot { position: absolute; top: 8px; left: 8px; z-index: 2; }
    .body { padding: .7rem .8rem .85rem; display: flex; flex-direction: column; gap: .4rem; flex: 1; }
    .body h3 { margin: 0; font-size: .9rem; font-weight: 600; line-height: 1.3;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.35em; }
    .badge-free { align-self: flex-start; display: inline-flex; align-items: center; gap: .25rem; }
    .pricing { display: flex; align-items: baseline; gap: .3rem; }
    .price { color: var(--sale); font-weight: 800; font-size: 1.2rem; }
    .unit { color: var(--muted); font-size: .75rem; }
    .foot { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: .5rem; }
    .stockline { color: var(--muted); font-size: .78rem; }
    .stockline.low { color: var(--sale); font-weight: 700; }
    .btn.sm { padding: .45rem .85rem; font-size: .82rem; }
    .skeleton { height: 280px; border: 1px solid var(--border);
      background: linear-gradient(100deg, #f5f5f5 30%, #ececec 50%, #f5f5f5 70%); background-size: 200% 100%; animation: sk 1.2s infinite; }
    @keyframes sk { to { background-position: -200% 0; } }
    .empty { grid-column: 1 / -1; text-align: center; color: var(--muted); padding: 3rem 0; display: grid; gap: 1rem; justify-items: center; }
    .error { color: var(--sale); }
    @media (max-width: 820px) { .layout { grid-template-columns: 1fr; } }
  `],
})
export class Catalog implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly query = signal('');
  readonly added = signal<number | null>(null);

  private readonly params = toSignal(this.route.queryParamMap);
  readonly selectedCategory = computed(() => {
    const raw = this.params()?.get('category');
    return raw ? Number(raw) : null;
  });
  readonly activeName = computed(() => {
    const id = this.selectedCategory();
    return id == null ? null : (this.categories().find((c) => c.id === id)?.name ?? null);
  });

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const cat = this.selectedCategory();
    let list = this.products().filter((p) => p.status !== 'DELETED');
    if (cat != null) list = list.filter((p) => p.category?.id === cat);
    if (q) list = list.filter((p) =>
      p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q));
    return list;
  });

  ngOnInit(): void {
    this.productService.list().subscribe({
      next: (list) => { this.products.set(list); this.loading.set(false); },
      error: (e) => { this.error.set(e?.message ?? 'error'); this.loading.set(false); },
    });
    this.productService.categories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: () => { /* categorías opcionales para el filtro */ },
    });
  }

  onSearch(event: Event): void { this.query.set((event.target as HTMLInputElement).value); }
  clear(): void { this.query.set(''); }

  add(p: Product): void {
    this.cart.add(p);
    this.added.set(p.id);
    setTimeout(() => { if (this.added() === p.id) this.added.set(null); }, 1200);
  }

  tint(p: Product): string {
    const hues = [22, 200, 275, 145, 330, 45];
    const key = p.category?.id ?? p.id;
    return `hsl(${hues[key % hues.length]} 70% 45%)`;
  }
  initials(name: string): string {
    return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }
}
