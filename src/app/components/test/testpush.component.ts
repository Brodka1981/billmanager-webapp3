import { Component } from '@angular/core';
import { getMessaging, getToken } from "firebase/messaging";
import { firebaseApp } from '../../firebase-config';

@Component({
  selector: 'app-test-push',
  template: `<button (click)="requestToken()">Ottieni Token FCM</button>`
})
export class TestPushComponent {

  async requestToken() {
    const messaging = getMessaging(firebaseApp);

    try {
      const token = await getToken(messaging, {
        vapidKey: "BN0g01ZTYuJF3aR1v1LCk5WZ0JVfBHJNpTAL2kalhOuzwHY1dbWkyP7MKwiiM_4MvkXkDBQZYD34A6BqvZZaX78",
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });

      console.log("TOKEN FCM:", token);
      alert(token);
    } catch (err) {
      console.error("Errore token:", err);
    }
  }
}
