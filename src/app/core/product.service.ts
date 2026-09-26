import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './config';
import { Category, Product } from './models';

/** Ep. 2 — consumo del catálogo a través de Kong. */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_BASE}/products`);
  }

  get(id: number): Observable<Product> {
    return this.http.get<Product>(`${API_BASE}/products/${id}`);
  }

  categories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE}/categories`);
  }
}
