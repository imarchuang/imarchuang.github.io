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

function isPlainObject(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isPersistedElement(value) {
  return (
    isPlainObject(value) &&
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.type === "string" &&
    value.type.trim().length > 0
  );
}

function validateScene(scene) {
  if (scene === null) {
    return null;
  }

  if (
    !isPlainObject(scene) ||
    !Array.isArray(scene.elements) ||
    !scene.elements.every(isPersistedElement) ||
    !isPlainObject(scene.appState) ||
    !isPlainObject(scene.files)
  ) {
    return null;
  }

  return scene;
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
  return transact("readonly", (store) => store.get(CURRENT_SCENE)).then(
    validateScene,
  );
}

export function clearScene() {
  return transact("readwrite", (store) => store.delete(CURRENT_SCENE));
}

export function debounce(fn, delay) {
  let timer = null;
  let latestArgs = null;
  let pendingPromise = null;
  let resolvePending = null;
  let rejectPending = null;

  function clearPending() {
    pendingPromise = null;
    resolvePending = null;
    rejectPending = null;
    latestArgs = null;
  }

  function invoke() {
    timer = null;

    const run = Promise.resolve().then(() => fn(...latestArgs));

    run.then(
      (value) => {
        resolvePending?.(value);
        clearPending();
      },
      (error) => {
        rejectPending?.(error);
        clearPending();
      },
    );

    return run;
  }

  const debounced = (...args) => {
    latestArgs = args;

    if (!pendingPromise) {
      pendingPromise = new Promise((resolve, reject) => {
        resolvePending = resolve;
        rejectPending = reject;
      });
    }

    clearTimeout(timer);
    timer = setTimeout(invoke, delay);
    return pendingPromise;
  };

  debounced.flush = () => {
    if (!pendingPromise) {
      return Promise.resolve(null);
    }

    if (timer) {
      clearTimeout(timer);
      return invoke();
    }

    return pendingPromise;
  };

  debounced.pending = () => pendingPromise !== null;

  return debounced;
}
