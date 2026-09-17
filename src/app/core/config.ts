import { AuthConfig } from 'angular-oauth2-oidc';

/**
 * Configuración de la SPA. La API se consume SIEMPRE a través del gateway Kong.
 * El login usa OIDC (Authorization Code + PKCE) contra el Spring Authorization Server.
 */
export const API_BASE = 'http://localhost:8000'; // Kong (gateway)

export const authConfig: AuthConfig = {
  issuer: 'http://localhost:9000',              // Spring Authorization Server
  redirectUri: window.location.origin,
  postLogoutRedirectUri: window.location.origin,
  clientId: 'store-spa',                         // cliente público (PKCE)
  responseType: 'code',
  scope: 'openid profile product.read customer.read invoice.read invoice.write',
  requireHttps: false,                           // solo desarrollo
  showDebugInformation: true,
  useSilentRefresh: false,
};
