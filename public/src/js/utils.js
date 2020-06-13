const dbPromise = idb.open('posts-store', 1, function (db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', { keyPath: 'id' });
  }
});

function writeData(st, data) {
  return dbPromise.then(function (db) {
    const transaction = db.transaction(st, 'readwrite');
    const store = transaction.objectStore(st);
    store.put(data);
  });
}

function readAllData(st) {
  return dbPromise.then(function (db) {
    const transaction = db.transaction(st, 'readonly');
    const store = transaction.objectStore(st);
    return store.getAll();
  });
}
