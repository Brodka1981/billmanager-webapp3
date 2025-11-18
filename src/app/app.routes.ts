import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { RegisterComponent } from './components/register/register.component';
import { AnnualStatisticsComponent } from './components/annual-statistics/annual-statistics.component';

export const routes: Routes = [
  { path: '', redirectTo: 'admin', pathMatch: 'full' }, // Route di default
  { path: 'properties/:propertyId', component: HomeComponent, canActivate: [authGuard] },
  { path: 'properties/:propertyId/statistics', component: AnnualStatisticsComponent, canActivate: [authGuard] },
  { path: 'properties/:propertyId/upcoming', component: HomeComponent, canActivate: [authGuard] },
  { path: 'properties/:propertyId/expired', component: HomeComponent, canActivate: [authGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' } // Rotta di fallback
];
