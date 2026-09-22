import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './config';
import { Invoice, InvoiceRequest } from './models';

/** Ep. 7 — facturación: crear factura (dispara la saga) y consultar su estado. */
@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);

  create(request: InvoiceRequest): Observable<Invoice> {
    return this.http.post<Invoice>(`${API_BASE}/invoices`, request);
  }

  get(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${API_BASE}/invoices/${id}`);
  }
}
