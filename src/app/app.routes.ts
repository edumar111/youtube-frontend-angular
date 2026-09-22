import { Routes } from '@angular/router';
import { Catalog } from './features/catalog/catalog';
import { Cart } from './features/cart/cart';
import { Checkout } from './features/checkout/checkout';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'catalog' },
  { path: 'catalog', component: Catalog },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout, canActivate: [authGuard] },
  { path: '**', redirectTo: 'catalog' },
];
