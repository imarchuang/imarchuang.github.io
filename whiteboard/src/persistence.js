import { isThemePreference } from "./theme";

const DB_NAME = "marc-personal-whiteboard";
const DB_VERSION = 1;
const STORE_NAME = "scenes";
const CURRENT_SCENE = "current";
const SUPPORTED_PERSISTED_ELEMENT_TYPES = new Set([
  // Excalidraw 0.18.1 persisted scene element types from
  // `dist/types/excalidraw/element/types.d.ts`, excluding the internal
  // "selection" helper element.
  "rectangle",
  "diamond",
  "ellipse",
  "embeddable",
  "iframe",
  "image",
  "frame",
  "magicframe",
  "text",
  "line",
  "arrow",
  "freedraw",
]);
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
    SUPPORTED_PERSISTED_ELEMENT_TYPES.has(value.type.trim())
  );
}

function isPersistedMetadata(value) {
  return (
    value === undefined ||
    (isPlainObject(value) &&
      (value.themePreference === undefined ||
        isThemePreference(value.themePreference)))
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
    !isPlainObject(scene.files) ||
    !isPersistedMetadata(scene.metadata)
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

export function selectPersistedMetadata(metadata = {}) {
  return Object.fromEntries(
    ["themePreference"]
      .filter((key) => metadata[key] !== undefined)
      .map((key) => [key, metadata[key]]),
  );
}

export function saveScene({ elements, appState, files, metadata }) {
  return transact("readwrite", (store) =>
    store.put(
      {
        elements,
        appState: selectPersistedAppState(appState),
        files,
        metadata: selectPersistedMetadata(metadata),
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
  let queuedArgs = null;
  let queuedPromise = null;
  let resolveQueued = null;
  let rejectQueued = null;
  let inFlightPromise = null;

  function ensureQueuedPromise() {
    if (!queuedPromise) {
      queuedPromise = new Promise((resolve, reject) => {
        resolveQueued = resolve;
        rejectQueued = reject;
      });
    }

    return queuedPromise;
  }

  async function invokeNext() {
    if (!queuedArgs) {
      return null;
    }

    timer = null;

    if (inFlightPromise) {
      try {
        await inFlightPromise;
      } catch {
        // Allow the newest queued scene to retry after a failed save.
      }

      if (!queuedArgs) {
        return null;
      }
    }

    const args = queuedArgs;
    const resolve = resolveQueued;
    const reject = rejectQueued;
    queuedArgs = null;
    queuedPromise = null;
    resolveQueued = null;
    rejectQueued = null;

    const run = Promise.resolve().then(() => fn(...args));
    inFlightPromise = run;

    try {
      const value = await run;
      resolve?.(value);
      return value;
    } catch (error) {
      reject?.(error);
      throw error;
    } finally {
      if (inFlightPromise === run) {
        inFlightPromise = null;
      }
    }
  }

  const debounced = (...args) => {
    queuedArgs = args;
    const pending = ensureQueuedPromise();

    clearTimeout(timer);
    timer = setTimeout(() => {
      void invokeNext().catch(() => {});
    }, delay);
    return pending;
  };

  debounced.flush = async () => {
    if (!queuedArgs && !inFlightPromise) {
      return null;
    }

    clearTimeout(timer);
    timer = null;

    let latestError = null;
    let latestValue = null;

    while (queuedArgs || inFlightPromise) {
      try {
        if (queuedArgs) {
          latestValue = await invokeNext();
        } else {
          latestValue = await inFlightPromise;
        }
      } catch (error) {
        latestError = error;
      }
    }

    if (latestError) {
      throw latestError;
    }

    return latestValue;
  };

  debounced.pending = () =>
    queuedArgs !== null || timer !== null || inFlightPromise !== null;

  return debounced;
}

export { SUPPORTED_PERSISTED_ELEMENT_TYPES };
