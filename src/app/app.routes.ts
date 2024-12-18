import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AddBillComponent } from './components/add-bill/add-bill.component';

export const routes: Routes = [
  { path: '', redirectTo: '/properties/1', pathMatch: 'full' }, // Route di default
  { path: 'properties/:propertyId', component: HomeComponent },
  { path: 'properties/:propertyId/upcoming', component: HomeComponent },
  { path: 'properties/:propertyId/expired', component: HomeComponent },
  { path: 'properties/:propertyId/add-bill', component: AddBillComponent },
  { path: 'properties/:propertyId/edit-bill/:id', component: AddBillComponent }, // Rotta per la modifica
  { path: '**', redirectTo: '' } // Rotta di fallback
];
