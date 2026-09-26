import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './config';

export interface ChatResponse {
  answer: string;
}

/** Ep. 15 — cliente del asistente (Spring AI + Claude), a través de Kong. */
@Injectable({ providedIn: 'root' })
export class AssistantService {
  private readonly http = inject(HttpClient);

  chat(message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${API_BASE}/assistant/chat`, { message });
  }
}
