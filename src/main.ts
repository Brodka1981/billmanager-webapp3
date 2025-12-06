import '@angular/localize/init'; // Inizializza il modulo di localizzazione

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';  // Importa i dati locali italiani

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(() => console.log("Service Worker registrato"))
    .catch(err => console.error("SW registration error", err));
}

registerLocaleData(localeIt);  // Registra i dati locali italiani

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
