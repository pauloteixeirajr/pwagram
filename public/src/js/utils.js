const dbPromise = idb.open('posts-store', 1, function (db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', { keyPath: 'id' });
  }

  if (!db.objectStoreNames.contains('sync-posts')) {
    db.createObjectStore('sync-posts', { keyPath: 'id' });
  }
});

function writeData(st, data) {
  return dbPromise.then(function (db) {
    const transaction = db.transaction(st, 'readwrite');
    const store = transaction.objectStore(st);
    store.put(data);
    return transaction.complete;
  });
}

function readAllData(st) {
  return dbPromise.then(function (db) {
    const transaction = db.transaction(st, 'readonly');
    const store = transaction.objectStore(st);
    return store.getAll();
  });
}

function clearAllData(st) {
  return dbPromise.then(function (db) {
    const transaction = db.transaction(st, 'readwrite');
    const store = transaction.objectStore(st);
    store.clear();
    return transaction.complete;
  });
}

function deleteItemFromData(st, id) {
  return dbPromise.then(function (db) {
    const transaction = db.transaction(st, 'readwrite');
    const store = transaction.objectStore(st);
    store.delete(id);
    return transaction.complete;
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/\_/, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
