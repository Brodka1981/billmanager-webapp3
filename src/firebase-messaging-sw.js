// firebase-messaging-sw.js

// Importa Firebase nel service worker (usiamo compat per semplicità)
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

// La tua configurazione Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBSMU8KQZIJXv5j5fLk1I_D2SahgQ9UbBQ",
  authDomain: "bill-manager-8c2ea.firebaseapp.com",
  projectId: "bill-manager-8c2ea",
  storageBucket: "bill-manager-8c2ea.firebasestorage.app",
  messagingSenderId: "238326632978",
  appId: "1:238326632978:web:e9e281fe24c0d032403ecb"
});

// Recupera il messaging
const messaging = firebase.messaging();

// Gestione notifiche in arrivo quando la web app è *chiusa*
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Ricevuto background message', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icon-192x192.png' // opzionale
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
