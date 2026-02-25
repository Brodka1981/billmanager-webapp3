import { Injectable } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalNotifications } from '@capacitor/local-notifications';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNativeService {

  private apiAdmin = environment.apiAdmin;

  constructor(private http: HttpClient) {}

  async registerAndroidPush(tok: string) {
    // ⚠️ Questo service deve girare SOLO su Android/iOS
    const info = await Device.getInfo();
    if (info.platform !== 'android' && info.platform !== 'ios') {
      return;
    }

    // 1️⃣ Richiedi permessi
    const permStatus = await PushNotifications.requestPermissions();
    if (permStatus.receive !== 'granted') {
      console.warn('Permessi notifiche negati');
      return;
    }

    // 2️⃣ Registra il device
    await PushNotifications.register();

    // 3️⃣ Ricevi token FCM nativo
    PushNotifications.addListener('registration', async (token) => {
      console.log('ANDROID FCM TOKEN:', token.value);

      const headers = new HttpHeaders().set(
        'Authorization',
        `Bearer ${tok}`
      );

      await this.http.post(
        `${this.apiAdmin}/pushregister`,
        {
          deviceToken: token.value,
          platform: 'android'
        },
        { headers }
      ).toPromise();
    });

    PushNotifications.addListener('registrationError', err => {
      console.error('Errore registrazione push native', err);
    });

    // opzionale: push ricevuta
    /*PushNotifications.addListener('pushNotificationReceived', notification => {
      console.log('Push ricevuta (foreground)', notification);
    });*/
    PushNotifications.addListener('pushNotificationReceived', async notification => {
      console.log('🔥 PUSH FOREGROUND', notification);

      // Android NON mostra automaticamente la notifica in foreground
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: notification.title ?? 'Notifica',
            body: notification.body ?? ''
          }
        ]
      });
    });
    /*
    PushNotifications.addListener('pushNotificationReceived',async notification => {

        console.log('Push ricevuta (foreground)', notification);

        await LocalNotifications.schedule({
          notifications: [
            {
              id: Date.now(),
              title: notification.data?.title ?? notification.title ?? 'Notifica',
              body: notification.data?.body ?? notification.body ?? '',
              schedule: { at: new Date(Date.now() + 100) }
            }
          ]
        });
      }
    );*/

    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      console.log('Click su notifica', action);
    });
  }
}
