import { Component, Input } from '@angular/core';

/**
 * Sistema de íconos SVG (24×24, stroke = currentColor). Uso: <app-icon name="cart" />.
 * Centraliza el set para mantener consistencia (estilo Temu, línea limpia).
 */
@Component({
  selector: 'app-icon',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      @switch (name) {
        @case ('search') { <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/> }
        @case ('cart') { <circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L23 7H6"/> }
        @case ('user') { <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/> }
        @case ('grid') { <rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/> }
        @case ('tag') { <path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/> }
        @case ('truck') { <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/> }
        @case ('shield') { <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/> }
        @case ('chevron') { <path d="M9 6l6 6-6 6"/> }
        @case ('flame') { <path d="M12 3s5 3.5 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 2 2c0-3 2-5 2-8Z"/> }
        @default { <circle cx="12" cy="12" r="9"/> }
      }
    </svg>
  `,
})
export class Icon {
  @Input() name = 'grid';
  @Input() size = 20;
}
