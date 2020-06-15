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

function askForNotificationPermissions() {
  Notification.requestPermission().then(function (result) {
    if (result !== 'granted') {
      console.log('No notifications permissions granted!');
    } else {
      console.log('User granted permission');
    }
  });
}

if ('Notification' in window) {
  enableNotificationsButtons.forEach(function (button) {
    button.style.display = 'inline-block';
    button.addEventListener('click', askForNotificationPermissions);
  });
}
