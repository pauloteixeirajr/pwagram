let deferredPrompt;

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
