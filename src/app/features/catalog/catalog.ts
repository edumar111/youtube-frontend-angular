import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../core/product.service';
import { CartService } from '../../core/cart.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-catalog',
  imports: [CurrencyPipe],
  template: `
    <section class="hero">
      <div class="hero-inner">
        <p class="eyebrow">Tienda demo · microservicios</p>
        <h1>Encuentra tu próximo <em>favorito</em>.</h1>
        <p class="sub">Catálogo servido por los microservicios a través del gateway.</p>

        <div class="search">
          <svg viewBox="0 0 24 24" class="ic" aria-hidden="true">
            <path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              d="M21 21l-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/>
          </svg>
          <input type="search" [value]="query()" (input)="onSearch($event)"
                 placeholder="Buscar productos por nombre o descripción…" aria-label="Buscar" />
          @if (query()) { <button class="clear" (click)="clear()" aria-label="Limpiar">✕</button> }
        </div>
      </div>
    </section>

    <section class="wrap">
      @if (loading()) {
        <div class="grid">
          @for (n of [1,2,3,4,5,6]; track n) { <div class="card skeleton"></div> }
        </div>
      } @else if (error()) {
        <p class="error">No se pudo cargar el catálogo: {{ error() }}</p>
      } @else {
        <div class="toolbar">
          <span class="count">{{ filtered().length }} producto(s)
            @if (query()) { <span class="muted">para “{{ query() }}”</span> }
          </span>
        </div>
        <div class="grid">
          @for (p of filtered(); track p.id; let i = $index) {
            <article class="card" [style.animation-delay.ms]="i * 45">
              <div class="thumb" [style.background]="tint(p)">
                <span class="chip">{{ p.category?.name || 'general' }}</span>
                <span class="glyph">{{ initials(p.name) }}</span>
              </div>
              <div class="body">
                <h3>{{ p.name }}</h3>
                <p class="desc">{{ p.description }}</p>
                <div class="row">
                  <div>
                    <span class="price">{{ p.price | currency:'USD' }}</span>
                    <span class="stock" [class.low]="p.stock <= 3">· {{ p.stock }} en stock</span>
                  </div>
                  <button class="btn btn-accent sm" (click)="add(p)">
                    {{ added() === p.id ? '✓ Añadido' : 'Agregar' }}
                  </button>
                </div>
              </div>
            </article>
          } @empty {
            <div class="empty">
              <p>Sin resultados para “{{ query() }}”.</p>
              <button class="btn btn-ghost" (click)="clear()">Ver todo el catálogo</button>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .hero { border-bottom: 1px solid var(--border); }
    .hero-inner { max-width: var(--maxw); margin: 0 auto; padding: 3rem 1.5rem 2rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: .18em; font-size: .72rem; font-weight: 700;
               color: var(--brand); margin: 0 0 .6rem; }
    .hero h1 { font-size: clamp(2rem, 5vw, 3.1rem); line-height: 1.02; margin: 0; }
    .hero h1 em { font-style: italic; color: var(--accent); }
    .sub { color: var(--muted); margin: .7rem 0 1.6rem; font-size: 1.02rem; }
    .search { position: relative; max-width: 560px; }
    .search .ic { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: var(--muted); }
    .search input {
      width: 100%; font-family: var(--font-ui); font-size: 1rem; color: var(--ink);
      background: var(--surface); border: 1px solid var(--border-strong); border-radius: var(--r-pill);
      padding: .9rem 2.6rem; box-shadow: var(--shadow-sm); transition: border-color .15s, box-shadow .15s;
    }
    .search input:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 4px var(--brand-050); }
    .clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
             border: none; background: var(--surface-2); color: var(--ink-soft); width: 26px; height: 26px;
             border-radius: 50%; cursor: pointer; }

    .wrap { max-width: var(--maxw); margin: 0 auto; padding: 1.5rem 1.5rem 3rem; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; margin: .5rem 0 1.2rem; }
    .count { font-weight: 600; color: var(--ink-soft); } .muted { color: var(--muted); font-weight: 500; }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.3rem; }
    .card {
      background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg);
      overflow: hidden; box-shadow: var(--shadow-sm); display: flex; flex-direction: column;
      animation: rise .5s ease both; transition: transform .18s ease, box-shadow .18s ease, border-color .18s;
    }
    .card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--border-strong); }
    .thumb { position: relative; aspect-ratio: 16 / 10; display: grid; place-items: center; }
    .thumb .glyph { font-family: var(--font-display); font-weight: 700; font-size: 2.4rem; color: rgba(255,255,255,.92);
                    text-shadow: 0 2px 10px rgba(0,0,0,.18); }
    .chip { position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,.9); color: var(--ink);
            font-size: .72rem; font-weight: 700; padding: .25rem .6rem; border-radius: var(--r-pill); text-transform: capitalize; }
    .body { padding: 1rem 1.1rem 1.15rem; display: flex; flex-direction: column; gap: .35rem; flex: 1; }
    .body h3 { margin: 0; font-size: 1.08rem; }
    .desc { color: var(--muted); font-size: .86rem; line-height: 1.4; min-height: 2.4em;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .row { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: .6rem; }
    .price { color: var(--price); font-weight: 700; font-size: 1.1rem; }
    .stock { color: var(--muted); font-size: .8rem; margin-left: .35rem; }
    .stock.low { color: var(--accent); font-weight: 600; }
    .btn.sm { padding: .5rem .95rem; font-size: .85rem; }

    .skeleton { height: 300px; border: 1px solid var(--border);
      background: linear-gradient(100deg, var(--surface-2) 30%, #eee 50%, var(--surface-2) 70%);
      background-size: 200% 100%; animation: sk 1.2s infinite; }
    @keyframes sk { to { background-position: -200% 0; } }
    .empty { grid-column: 1 / -1; text-align: center; color: var(--muted); padding: 3rem 0; display: grid; gap: 1rem; justify-items: center; }
    .error { color: var(--danger); }
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

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  clear(): void { this.query.set(''); }

  add(p: Product): void {
    this.cart.add(p);
    this.added.set(p.id);
    setTimeout(() => { if (this.added() === p.id) this.added.set(null); }, 1200);
  }

  /** Degradado estable por categoría para el placeholder de la tarjeta. */
  tint(p: Product): string {
    const hues = [168, 12, 210, 280, 340, 45];
    const key = p.category?.id ?? p.id;
    const h = hues[key % hues.length];
    return `linear-gradient(135deg, hsl(${h} 55% 42%), hsl(${(h + 28) % 360} 60% 30%))`;
  }

  initials(name: string): string {
    return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }
}
