const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector(
  '#close-create-post-modal-btn'
);
const sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');
const firebase = 'https://pwgram.firebaseio.com/posts.json';
let networkRecieved = false;

function openCreatePostModal() {
  createPostArea.style.transform = 'translateY(0)';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function sendData() {
  fetch(firebase, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value.trim(),
      location: locationInput.value.trim(),
      image: '/src/images/sf-boat.jpg',
    }),
  }).then(function (res) {
    console.log('Sent data', res);
  });
}

form.addEventListener('submit', function (event) {
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data');
    return;
  }

  closeCreatePostModal();

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(function (sw) {
      const post = {
        id: new Date().toISOString(),
        title: titleInput.value.trim(),
        location: locationInput.value.trim(),
        image: '/src/images/sf-boat.jpg',
      };
      writeData('sync-posts', post)
        .then(function () {
          // Register sync task to SyncManager
          return sw.sync.register('sync-new-post');
        })
        .then(function () {
          const snackbar = document.getElementById('confirmation-toast');
          const data = { message: 'Your post was saved for syncing' };
          snackbar.MaterialSnackbar.showSnackbar(data);
        })
        .catch(console.log);
    });
  } else {
    sendData();
  }
});

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  let cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  let cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("' + data.image + '")';
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  let cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = '#fff';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  let cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUi(data) {
  for (let i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

fetch(firebase)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkRecieved = true;
    clearCards();
    updateUi(Object.values(data));
  });

if ('indexedDB' in window) {
  readAllData('posts').then(function (posts) {
    if (!networkRecieved) {
      updateUi(posts);
    }
  });
}
