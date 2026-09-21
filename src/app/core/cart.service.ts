import { Injectable, computed, signal } from '@angular/core';
import { CartItem, Product } from './models';

const STORAGE_KEY = 'store-cart';

/** Ep. 6 — carrito con signals; persiste en localStorage. */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(this.load());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((n, i) => n + i.quantity, 0));
  readonly total = computed(() =>
    this._items().reduce((sum, i) => sum + i.product.price * i.quantity, 0));

  add(product: Product, quantity = 1): void {
    const items = [...this._items()];
    const existing = items.find((i) => i.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ product, quantity });
    }
    this.commit(items);
  }

  setQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this.commit(this._items().map((i) =>
      i.product.id === productId ? { ...i, quantity } : i));
  }

  remove(productId: number): void {
    this.commit(this._items().filter((i) => i.product.id !== productId));
  }

  clear(): void {
    this.commit([]);
  }

  private commit(items: CartItem[]): void {
    this._items.set(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* modo privado / almacenamiento no disponible */
    }
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  }
}
