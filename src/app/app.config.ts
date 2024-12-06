import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Importa provideHttpClient
import { routes } from './app.routes';
import { LOCALE_ID } from '@angular/core'; // Importa LOCALE_ID

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),  // Fornisce il router
    provideHttpClient(),    // Fornisce HttpClient
    { provide: LOCALE_ID, useValue: 'it' }  // Imposta il locale predefinito a italiano
  ],
};
