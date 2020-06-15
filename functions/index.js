const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const serviceAccount = require('./pwgram-private-key.json');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
admin.initializeApp({
  databaseURL: 'https://pwgram-b099b.firebaseio.com/',
  credential: admin.credential.cert(serviceAccount),
});

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, function () {
    const { id, title, location, image } = request.body;
    admin
      .database()
      .ref('posts')
      .push({
        id,
        title,
        location,
        image,
      })
      .then(function () {
        return response.status(201).json({ message: 'Data store', id });
      })
      .catch(function (err) {
        return response.status(500).json({ error: err });
      });
  });
});
