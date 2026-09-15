# youtube-frontend-angular

Frontend **Angular** de la tienda del curso "Microservicios Modernos con Spring Boot 4 y Java 25"
(Digital Lab Academy). Mini-curso complementario del backend
[`youtube-microservices-spring`](https://github.com/edumar111/youtube-microservices-spring).

SPA que consume los microservicios **a través de Kong**, con **login OIDC (Authorization Code + PKCE)**
contra el Spring Authorization Server, carrito y **checkout que dispara la saga** (Outbox/Kafka) y refleja
la transición `PENDING → CONFIRMED/CANCELLED`.

## Stack

Angular 22 (standalone + signals, control flow `@if`/`@for`) · TypeScript · `angular-oauth2-oidc` (PKCE) ·
HttpClient con interceptor de Bearer token · Nginx + Docker.

## Requisitos

- **Node 22** (la CLI de Angular exige `^22.22.3 || ^24.15.0`). Con nvm: `nvm use 22`.
- El **backend corriendo** (repo `youtube-microservices-spring`): `make up`
  (levanta Postgres, Auth Server `:9000`, Kafka, servicios, Kong `:8000`, observabilidad).

## Configuración

En `src/app/core/config.ts`:
- `API_BASE = http://localhost:8000` (Kong)
- OIDC `issuer = http://localhost:9000`, `clientId = store-spa` (cliente público PKCE ya registrado en el backend).

El backend ya trae los ajustes necesarios (cliente `store-spa` con PKCE y **CORS** en Kong y en el Auth Server).

## Desarrollo

```bash
nvm use 22
npm install
npm start           # ng serve -> http://localhost:4200
```

## Build de producción / Docker

```bash
npm run build       # dist/youtube-frontend-angular/browser
docker build -t store-frontend .
docker run --rm -p 4200:80 store-frontend   # http://localhost:4200
```

## Estructura

```
src/app/
├── core/          servicios, modelos, auth (OIDC), interceptor, guard, config
├── features/
│   ├── catalog/   listado de productos (ep. 2-3)
│   ├── cart/      carrito con signals (ep. 6)
│   └── checkout/  checkout + saga (ep. 7)
└── shared/        header/navegación (login/logout, contador de carrito)
```

## Flujo

1. Catálogo (público) — lista productos vía Kong.
2. Agregar al carrito (signals + localStorage).
3. Checkout requiere sesión → login OIDC con PKCE contra el Auth Server.
4. Se crea la factura (`PENDING`) → el backend dispara la saga → la UI hace polling y muestra `CONFIRMED`/`CANCELLED`.
