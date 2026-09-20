import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { API_BASE } from './config';

/**
 * Ep. 5 — adjunta el Bearer token a las llamadas a la API (Kong). No toca el discovery
 * document ni el token endpoint del Authorization Server (los gestiona la librería OIDC).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken;
  if (token && req.url.startsWith(API_BASE)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
