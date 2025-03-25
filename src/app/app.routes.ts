import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AddBillComponent } from './components/add-bill/add-bill.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { AddPropertyComponent } from './components/add-property/add-property.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: 'admin', pathMatch: 'full' }, // Route di default
  { path: 'properties/:propertyId', component: HomeComponent, canActivate: [authGuard] },
  { path: 'properties/:propertyId/upcoming', component: HomeComponent, canActivate: [authGuard] },
  { path: 'properties/:propertyId/expired', component: HomeComponent, canActivate: [authGuard] },
  { path: 'properties/:propertyId/add-bill', component: AddBillComponent, canActivate: [authGuard] },
  { path: 'properties/:propertyId/edit-bill/:id', component: AddBillComponent, canActivate: [authGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: 'admin/add-property', component: AddPropertyComponent, canActivate: [authGuard] },
  { path: 'admin/edit-property/:id', component: AddPropertyComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' } // Rotta di fallback
];
