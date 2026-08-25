const DB_NAME = "marc-personal-whiteboard";
const DB_VERSION = 1;
const STORE_NAME = "scenes";
const CURRENT_SCENE = "current";
const SAFE_APP_STATE_KEYS = [
  "theme",
  "viewBackgroundColor",
  "gridSize",
  "gridStep",
  "gridModeEnabled",
  "zenModeEnabled",
  "name",
];

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transact(mode, operation) {
  return openDatabase().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = operation(store);
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => reject(transaction.error);
      }),
  );
}

export function selectPersistedAppState(appState = {}) {
  return Object.fromEntries(
    SAFE_APP_STATE_KEYS.filter((key) => appState[key] !== undefined).map(
      (key) => [key, appState[key]],
    ),
  );
}

export function saveScene({ elements, appState, files }) {
  return transact("readwrite", (store) =>
    store.put(
      {
        elements,
        appState: selectPersistedAppState(appState),
        files,
      },
      CURRENT_SCENE,
    ),
  );
}

export function loadScene() {
  return transact("readonly", (store) => store.get(CURRENT_SCENE));
}

export function clearScene() {
  return transact("readwrite", (store) => store.delete(CURRENT_SCENE));
}

export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
