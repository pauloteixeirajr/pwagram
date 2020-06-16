let deferredPrompt;
const enableNotificationsButtons = document.querySelectorAll(
  '.enable-notifications'
);
const firebaseSub = 'https://pwgram-b099b.firebaseio.com/subscriptions.json';
const vapidPublicKey =
  'BEsuJVLJ6LzSk1Vmf7sL84dIaojqn16MjG_ZPawgsbc1HZJ7UH2gpvuvczyKzrecI5pBC8kkvDIjS7WE10rVfcM';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(() => {
    console.log('Service worker registered');
  });
}

window.addEventListener('beforeinstallprompt', function (event) {
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmationNotification() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function (swreg) {
      swreg.showNotification('Successfully subscribed', {
        body: 'You will get new notifications from PWAgram!',
        icon: '/src/images/icons/app-icon-96x96.png',
        image: '/src/images/sf-boat.jpg',
        dir: 'ltr',
        lang: 'en-US',
        vibrate: [100, 50, 200], // vibration, pause, vibration in ms
        badge: '/src/images/icons/app-icon-96x96.png',
        tag: 'confirm-notification',
        renotify: true,
        actions: [
          {
            action: 'confirm',
            title: 'Okay',
            icon: '/src/images/icons/app-icon-96x96.png',
          },
          {
            action: 'cancel',
            title: 'Cancel',
            icon: '/src/images/icons/app-icon-96x96.png',
          },
        ],
      });
    });
  }
}

function configurePushSub() {
  if (!('serviceWorker' in navigator)) return;

  let reg;
  navigator.serviceWorker.ready
    .then(function (swReg) {
      reg = swReg;
      return swReg.pushManager.getSubscription();
    })
    .then(function (sub) {
      if (sub) {
        // Use existing subscription
      } else {
        // Create new subscription
        const convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey,
        });
      }
    })
    .then(function (newSub) {
      return fetch(firebaseSub, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(newSub),
      });
    })
    .then(function (res) {
      if (res.ok) {
        displayConfirmationNotification();
      }
    })
    .catch(console.log);
}

function askForNotificationPermissions() {
  Notification.requestPermission().then(function (result) {
    if (result !== 'granted') {
      console.log('No notifications permissions granted!');
    } else {
      console.log('User granted permission');
      // displayConfirmationNotification();
      configurePushSub();
    }
  });
}

if ('Notification' in window && 'serviceWorker' in navigator) {
  enableNotificationsButtons.forEach(function (button) {
    button.style.display = 'inline-block';
    button.addEventListener('click', askForNotificationPermissions);
  });
}
