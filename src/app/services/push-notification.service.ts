import { Injectable } from '@angular/core';
import { getMessaging, getToken } from "firebase/messaging";
import { firebaseApp } from '../firebase-config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private apiAdmin = environment.apiAdmin;

  constructor(private http: HttpClient) {}

  async registerDeviceToken(tok: string) {
    try {
      // 1) Verifica supporto browser
      if (!('Notification' in window)) {
        console.warn("Notifiche non supportate");
        return;
      }
      if (!('serviceWorker' in navigator)) {
        console.warn("ServiceWorker non supportati");
        return;
      }
      // 2) Controlla lo stato corrente
      const permission = Notification.permission;
      console.log('permission:'+ permission);

      if (permission === "denied") {
        console.warn("Permessi notifiche negati dall’utente.");
        return;
      }
      // 3) Se non è “granted”, chiedi permesso
      if (permission !== "granted") {
        const result = await Notification.requestPermission();
        if (result !== "granted") {
          console.warn("L’utente ha rifiutato i permessi.");
          return;
        }
      }

      // 4) Ottieni token FCM
      const messaging = getMessaging(firebaseApp);

      const token = await getToken(messaging, {
        vapidKey: "BN0g01ZTYuJF3aR1v1LCk5WZ0JVfBHJNpTAL2kalhOuzwHY1dbWkyP7MKwiiM_4MvkXkDBQZYD34A6BqvZZaX78",
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });

      console.log("TOKEN FCM:", token);

      // invia il token al backend
      const headers = new HttpHeaders().set('Authorization', `Bearer ${tok}`);
      await this.http.post(`${this.apiAdmin}/pushregister`, {
        deviceToken: token,
        platform: 'web'
      }, { headers }).toPromise();

    } catch (err) {
      console.error("Errore nel recupero del token push:", err);
    }
  }
}
