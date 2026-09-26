import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../core/models';
import { Icon } from '../../shared/icon';

/**
 * Panel lateral de categorías (estilo Temu). Navega por query param ?category=<id>;
 * el catálogo reacciona y filtra. "Todas" limpia el filtro.
 */
@Component({
  selector: 'app-category-sidebar',
  imports: [RouterLink, Icon],
  template: `
    <aside class="side">
      <p class="head"><app-icon name="grid" [size]="18" /> Categorías</p>
      <nav>
        <a routerLink="/catalog" [class.active]="selected == null">
          <app-icon name="flame" [size]="18" /> <span>Todas</span>
        </a>
        @for (c of categories; track c.id) {
          <a routerLink="/catalog" [queryParams]="{ category: c.id }" [class.active]="selected === c.id">
            <app-icon name="tag" [size]="18" /> <span>{{ c.name }}</span>
          </a>
        }
      </nav>

      <div class="perks">
        <p><app-icon name="truck" [size]="18" /> Envío gratis</p>
        <p><app-icon name="shield" [size]="18" /> Devolución garantizada</p>
      </div>
    </aside>
  `,
  styles: [`
    .side { position: sticky; top: 128px; background: #fff; border: 1px solid var(--border);
            border-radius: var(--r); padding: .75rem; }
    .head { display: flex; align-items: center; gap: .5rem; font-weight: 700; color: var(--ink);
            margin: .2rem .4rem .6rem; font-size: .9rem; }
    nav { display: flex; flex-direction: column; gap: 2px; }
    nav a { display: flex; align-items: center; gap: .6rem; padding: .55rem .6rem; border-radius: var(--r-sm);
            color: var(--ink); font-size: .9rem; font-weight: 500; text-transform: capitalize; }
    nav a:hover { background: var(--surface-2); }
    nav a.active { background: var(--primary-050); color: var(--primary); font-weight: 700; }
    nav a.active app-icon { color: var(--primary); }
    .perks { border-top: 1px solid var(--border); margin-top: .7rem; padding-top: .7rem; display: grid; gap: .5rem; }
    .perks p { display: flex; align-items: center; gap: .5rem; margin: 0; color: var(--success); font-size: .82rem; font-weight: 600; }
    @media (max-width: 820px) { .side { position: static; } }
  `],
})
export class CategorySidebar {
  @Input() categories: Category[] = [];
  @Input() selected: number | null = null;
}
