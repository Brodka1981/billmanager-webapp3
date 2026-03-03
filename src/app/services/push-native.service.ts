import { Injectable } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalNotifications } from '@capacitor/local-notifications';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNativeService {

  private apiAdmin = environment.apiAdmin;

  // scegli un id canale tuo
  private readonly ANDROID_CHANNEL_ID = 'overdue_bills_high';

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

    await LocalNotifications.requestPermissions();
    // ANDROID: crea canale HIGH (heads-up)
    if (info.platform === 'android') {
      await LocalNotifications.createChannel({
        id: this.ANDROID_CHANNEL_ID,
        name: 'Avvisi bollette',
        description: 'Notifiche per bollette scadute',
        importance: 5, // 5 = HIGH
        visibility: 1 // 1 = PUBLIC
        //sound: 'default'
      });
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

    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      console.log('Click su notifica', action);
    });
  }
}
