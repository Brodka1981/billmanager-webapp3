import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { RegisterComponent } from './components/register/register.component';
import { AnnualStatisticsComponent } from './components/annual-statistics/annual-statistics.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { TestPushComponent } from './components/test/testpush.component';

export const routes: Routes = [
  { path: '', redirectTo: 'admin', pathMatch: 'full' }, // Route di default
  { path: 'properties/:propertyId', component: HomeComponent, canActivate: [authGuard] },
  { path: 'properties/:propertyId/statistics', component: AnnualStatisticsComponent, canActivate: [authGuard] },
  { path: 'properties/:propertyId/upcoming', component: HomeComponent, canActivate: [authGuard] },
  { path: 'properties/:propertyId/expired', component: HomeComponent, canActivate: [authGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'test', component: TestPushComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' } // Rotta di fallback
];
