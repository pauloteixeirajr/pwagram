let deferredPrompt;
let enableNotificationsButtons = document.querySelectorAll(
  '.enable-notifications'
);

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
      swreg.showNotification('Notifications Enabled', {
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

function askForNotificationPermissions() {
  Notification.requestPermission().then(function (result) {
    if (result !== 'granted') {
      console.log('No notifications permissions granted!');
    } else {
      console.log('User granted permission');
      displayConfirmationNotification();
    }
  });
}

if ('Notification' in window) {
  enableNotificationsButtons.forEach(function (button) {
    button.style.display = 'inline-block';
    button.addEventListener('click', askForNotificationPermissions);
  });
}
