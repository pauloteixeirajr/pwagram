const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const webpush = require('web-push');
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
        webpush.setVapidDetails(
          'mailto:business@pwagram.com',
          'BEsuJVLJ6LzSk1Vmf7sL84dIaojqn16MjG_ZPawgsbc1HZJ7UH2gpvuvczyKzrecI5pBC8kkvDIjS7WE10rVfcM',
          functions.config().pwgram.private_key
        );
        return admin
          .database()
          .ref('subscriptions')
          .once('value')
          .then(function (subscriptions) {
            subscriptions.forEach(function (sub) {
              const pushConfig = {
                endpoint: sub.val().endpoint,
                keys: {
                  auth: sub.val().keys.auth,
                  p256dh: sub.val().keys.p256dh,
                },
              };
              webpush
                .sendNotification(
                  pushConfig,
                  JSON.stringify({
                    title: 'Your New Post',
                    content: 'New post added!',
                    openUrl: '/help',
                  })
                )
                .catch(console.log);
            });
            return response.status(201).json({ message: 'Data store', id });
          });
      })
      .catch(function (err) {
        return response.status(500).json({ error: err });
      });
  });
});
