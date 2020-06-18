const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector(
  '#close-create-post-modal-btn'
);
const sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');
const firebase = 'https://pwgram-b099b.firebaseio.com/posts.json';
const firebaseApi =
  'https://us-central1-pwgram-b099b.cloudfunctions.net/storePostData';
let networkRecieved = false;

// Camera Elements
const videoPlayer = document.querySelector('#player');
const canvasElement = document.querySelector('#canvas');
const captureButton = document.querySelector('#capture-btn');
const imagePicker = document.querySelector('#image-picker');
const pickImageDiv = document.querySelector('#pick-image');
let picture;

// Location elements
const locationBtn = document.querySelector('#location-button');
const locationLoader = document.querySelector('#location-loader');
const manualLocationDiv = document.querySelector('#manual-location');
let fetchedLocation = {
  lat: null,
  lng: null,
};

locationBtn.addEventListener('click', function (event) {
  if (!('geolocation' in navigator)) return;

  locationBtn.style.display = 'none';
  locationLoader.style.display = 'block';
  navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log(position);
      locationBtn.style.display = 'inline';
      locationLoader.style.display = 'none';
      fetchedLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      locationInput.value = 'In Dublin';
      manualLocationDiv.classList.add('is-focused');
    },
    function (error) {
      console.log(error);
      locationBtn.style.display = 'inline';
      locationLoader.style.display = 'none';
      alert('Could not fetch location, please enter manually');
      fetchedLocation = {
        lat: null,
        lng: null,
      };
    },
    {
      timeout: 7000,
    }
  );
});

function initializeLocation() {
  if (!('geolocation' in navigator)) {
    locationBtn.style.display = 'none';
  }
}

function initializeMedia() {
  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      const getUsermedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      if (!getUsermedia) {
        return Promise.reject(new Error('getUserMedia is not implemented'));
      }

      return new Promise(function (resolve, reject) {
        getUsermedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      videoPlayer.style.display = 'block';
      videoPlayer.srcObject = stream;
    })
    .catch(function (err) {
      pickImageDiv.style.display = 'block';
    });
}

captureButton.addEventListener('click', function (event) {
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';

  const context = canvasElement.getContext('2d');
  context.drawImage(
    videoPlayer,
    0,
    0,
    canvasElement.width,
    videoPlayer.videoHeight / (videoPlayer.videoWidth / canvasElement.width)
  );
  videoPlayer.srcObject.getVideoTracks().forEach(function (track) {
    track.stop();
  });
  picture = dataURItoBlob(canvasElement.toDataURL());
});

imagePicker.addEventListener('change', function (event) {
  picture = event.target.files[0];
});

function openCreatePostModal() {
  setTimeout(function () {
    createPostArea.style.transform = 'translateY(0)';
  }, 1);
  initializeMedia();
  initializeLocation();
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
  pickImageDiv.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElement.style.display = 'none';
  locationBtn.style.display = 'inline';
  captureButton.style.display = 'inline';
  locationLoader.style.display = 'none';
  if (videoPlayer.srcObject) {
    videoPlayer.srcObject.getVideoTracks().forEach(function (track) {
      track.stop();
    });
  }
  setTimeout(function () {
    createPostArea.style.transform = 'translateY(100vh)';
  }, 1);
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function sendData() {
  const id = new Date().toISOString();
  const postData = new FormData();
  postData.append('id', id);
  postData.append('title', titleInput.value.trim());
  postData.append('location', locationInput.value.trim());
  postData.append('rawLocationLat', fetchedLocation.lat);
  postData.append('rawLocationLng', fetchedLocation.lng);
  postData.append('file', picture, id + '.png');
  fetch(firebaseApi, {
    method: 'POST',
    body: postData,
  }).then(function (res) {
    console.log('Sent data', res);
    updateUi();
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
        picture: picture,
        rawLocation: fetchedLocation,
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
