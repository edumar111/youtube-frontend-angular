import { Injectable, signal, inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './config';

/**
 * Ep. 5 — autenticación OIDC (Authorization Code + PKCE) contra el Authorization Server.
 * Expone el estado de sesión como signal y el token de acceso para el interceptor.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oauth = inject(OAuthService);
  readonly loggedIn = signal(false);

  /** Configura OIDC, carga el discovery document e intenta completar el login (callback). */
  async init(): Promise<void> {
    this.oauth.configure(authConfig);
    try {
      await this.oauth.loadDiscoveryDocumentAndTryLogin();
      this.loggedIn.set(this.oauth.hasValidAccessToken());
      this.oauth.setupAutomaticSilentRefresh();
    } catch (e) {
      console.error('OIDC init error', e);
      this.loggedIn.set(false);
    }
  }

  login(): void {
    this.oauth.initCodeFlow();
  }

  logout(): void {
    this.oauth.logOut();
    this.loggedIn.set(false);
  }

  get accessToken(): string | null {
    return this.oauth.getAccessToken();
  }

  get userName(): string {
    const claims = this.oauth.getIdentityClaims() as Record<string, unknown> | null;
    return (claims?.['sub'] as string) ?? 'usuario';
  }

  isLoggedIn(): boolean {
    return this.oauth.hasValidAccessToken();
  }
}
