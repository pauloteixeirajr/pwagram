const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const webpush = require('web-push');
const fs = require('fs');
const os = require('os');
const path = require('path');
const UUID = require('uuid-v4');
const busboy = require('busboy');

const serviceAccount = require('./pwgram-private-key.json');
const storageConfig = {
  projectId: 'pwgram-b099b',
  keyFilename: 'pwgram-private-key.json',
};
const gcs = require('@google-cloud/storage')(storageConfig);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
admin.initializeApp({
  databaseURL: 'https://pwgram-b099b.firebaseio.com/',
  credential: admin.credential.cert(serviceAccount),
});

exports.storePostData = functions.https.onRequest((request, response) => {
  cors(request, response, function () {
    const uuid = UUID();
    const bb = new busboy({ headers: request.headers });
    // These objects will store the values (file + fields extracted from busboy)

    let upload;
    const fields = {};

    bb.on('file', function (fieldname, file, filename, encoding, mimetype) {
      const filepath = path.join(os.tmpdir(), filename);
      upload = { file: filepath, type: mimetype };
      file.pipe(fs.createWriteStream(filepath));
    });

    // This will be invoked on every field detected
    bb.on('field', function (
      fieldname,
      val,
      fieldnameTruncated,
      valTruncated,
      encoding,
      mimetype
    ) {
      fields[fieldname] = val;
    });

    // This will be invoked after all uploads are complete
    bb.on('finish', function () {
      const bucket = gcs.bucket('pwgram-b099b.appspot.com');
      bucket.upload(
        upload.file,
        {
          uploadType: 'media',
          metadata: {
            metadata: {
              contentType: upload.type,
              firebaseStorageDownloadTokens: uuid,
            },
          },
        },
        function (err, uploadedFile) {
          if (err) {
            console.log(err);
            return;
          }
          const { id, title, location } = fields;
          return admin
            .database()
            .ref('posts')
            .push({
              id,
              title,
              location,
              rawLocation: {
                lat: fields.rawLocationLat,
                lng: fields.rawLocationLng,
              },
              image:
                'https://firebasestorage.googleapis.com/v0/b/' +
                bucket.name +
                '/o/' +
                encodeURIComponent(uploadedFile.name) +
                '?alt=media&token=' +
                uuid,
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
                  return response
                    .status(201)
                    .json({ message: 'Data store', id });
                });
            })
            .catch(function (err) {
              return response.status(500).json({ error: err });
            });
        }
      );
    });
    // The raw bytes of the upload will be in request.rawBody. Send it to busboy and get a callback when it's finished
    bb.end(request.rawBody);
  });
});
