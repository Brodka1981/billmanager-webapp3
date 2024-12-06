import '@angular/localize/init'; // Inizializza il modulo di localizzazione

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';  // Importa i dati locali italiani
registerLocaleData(localeIt);  // Registra i dati locali italiani

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
