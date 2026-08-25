# Personal Whiteboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a full Excalidraw personal whiteboard at `/draw/` with browser-only autosave and file import/export.

**Architecture:** A focused React/Vite application lives in `whiteboard/` and builds directly into the existing GitHub Pages root at `docs/draw/`. The official Excalidraw component supplies drawing and file controls; a small native IndexedDB module stores one current scene and fails without blocking the editor.

**Tech Stack:** React 19.2.8, Vite 8.2.2, `@excalidraw/excalidraw` 0.18.1, Vitest 4.1.11, `fake-indexeddb` 6.2.5, GitHub Pages.

## Global Constraints

- The live path is exactly `https://imarchuang.github.io/draw/`.
- Drawing data remains in the current browser unless explicitly exported.
- Do not add collaboration, authentication, server storage, cross-device sync, galleries, or scene history.
- The editor must remain usable when IndexedDB is unavailable or contains invalid data.
- Build output under `docs/draw/` is committed alongside source.
- The site is public; no secret or credential may be added.

---

## File map

- `whiteboard/package.json`: dependencies and build/test scripts.
- `whiteboard/package-lock.json`: deterministic dependency lock.
- `whiteboard/index.html`: Vite entry document.
- `whiteboard/vite.config.js`: `/draw/` base path, `docs/draw/` output, Vitest config.
- `whiteboard/src/main.jsx`: React root and Excalidraw stylesheet import.
- `whiteboard/src/App.jsx`: editor shell, restore flow, autosave status, navigation.
- `whiteboard/src/persistence.js`: IndexedDB API, persisted app-state selection, debounce.
- `whiteboard/src/persistence.test.js`: persistence success and failure tests.
- `whiteboard/src/styles.css`: full-viewport shell and scratchpad badge.
- `docs/draw/**`: generated production bundle.
- `docs/_sidebar.md`: real-path Whiteboard link.

### Task 1: Scaffold and test browser persistence

**Files:**
- Create: `whiteboard/package.json`
- Create: `whiteboard/index.html`
- Create: `whiteboard/vite.config.js`
- Create: `whiteboard/src/persistence.js`
- Create: `whiteboard/src/persistence.test.js`

**Interfaces:**
- Produces: `loadScene(): Promise<SceneData | null>`
- Produces: `saveScene(scene: SceneData): Promise<void>`
- Produces: `selectPersistedAppState(appState: object): object`
- Produces: `debounce(fn: Function, delay: number): Function`
- `SceneData` has `{ elements: readonly object[], appState: object, files: object }`.

- [ ] **Step 1: Create the package and Vite configuration**

Create `whiteboard/package.json`:

```json
{
  "name": "marc-personal-whiteboard",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build",
    "test": "vitest run"
  },
  "dependencies": {
    "@excalidraw/excalidraw": "0.18.1",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "6.1.0",
    "fake-indexeddb": "6.2.5",
    "vite": "8.2.2",
    "vitest": "4.1.11"
  }
}
```

Create `whiteboard/vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/draw/",
  plugins: [react()],
  build: {
    outDir: "../docs/draw",
    emptyOutDir: true,
  },
  test: {
    environment: "node",
  },
});
```

Create `whiteboard/index.html` with `#root` and `/src/main.jsx` as the module entry.

- [ ] **Step 2: Write failing persistence tests**

Create `whiteboard/src/persistence.test.js`:

```js
import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearScene,
  debounce,
  loadScene,
  saveScene,
  selectPersistedAppState,
} from "./persistence";

describe("scene persistence", () => {
  beforeEach(async () => {
    await clearScene();
  });

  it("round-trips elements, safe app state, and files", async () => {
    const scene = {
      elements: [{ id: "box", type: "rectangle" }],
      appState: {
        theme: "dark",
        viewBackgroundColor: "#111111",
        collaborators: new Map([["private", {}]]),
      },
      files: { image: { id: "image", dataURL: "data:image/png;base64,AA==" } },
    };

    await saveScene(scene);

    expect(await loadScene()).toEqual({
      elements: scene.elements,
      appState: {
        theme: "dark",
        viewBackgroundColor: "#111111",
      },
      files: scene.files,
    });
  });

  it("keeps only restorable app-state fields", () => {
    expect(
      selectPersistedAppState({
        theme: "light",
        gridSize: 20,
        zoom: { value: 2 },
        collaborators: new Map(),
      }),
    ).toEqual({ theme: "light", gridSize: 20 });
  });

  it("debounces writes", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const run = debounce(fn, 250);
    run("first");
    run("second");
    vi.advanceTimersByTime(250);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("second");
    vi.useRealTimers();
  });
});
```

- [ ] **Step 3: Run tests and confirm the expected failure**

Run:

```bash
cd whiteboard
npm install
npm test
```

Expected: FAIL because `persistence.js` does not exist.

- [ ] **Step 4: Implement the persistence module**

Create `whiteboard/src/persistence.js` using:

```js
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
```

- [ ] **Step 5: Run tests and commit**

Run `npm test`.

Expected: 3 tests pass.

Commit:

```bash
git add whiteboard
git commit -m "Add tested local scene persistence for the whiteboard"
```

### Task 2: Build the Excalidraw application shell

**Files:**
- Create: `whiteboard/src/main.jsx`
- Create: `whiteboard/src/App.jsx`
- Create: `whiteboard/src/styles.css`

**Interfaces:**
- Consumes: `loadScene`, `saveScene`, and `debounce` from Task 1.
- Produces: a full-viewport React application that mounts the official
  `Excalidraw` component and persists `onChange(elements, appState, files)`.

- [ ] **Step 1: Add the React entrypoint**

Create `whiteboard/src/main.jsx`:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@excalidraw/excalidraw/index.css";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 2: Implement restore and autosave**

Create `whiteboard/src/App.jsx` with:

```jsx
import { Excalidraw } from "@excalidraw/excalidraw";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce, loadScene, saveScene } from "./persistence";

const EMPTY_SCENE = {
  elements: [],
  appState: {},
  files: {},
};

export default function App() {
  const [initialData, setInitialData] = useState(null);
  const [status, setStatus] = useState("Loading local sketch…");

  useEffect(() => {
    loadScene()
      .then((scene) => {
        setInitialData(scene || EMPTY_SCENE);
        setStatus(scene ? "Restored locally" : "Saved in this browser");
      })
      .catch(() => {
        setInitialData(EMPTY_SCENE);
        setStatus("Local autosave unavailable");
      });
  }, []);

  const persist = useMemo(
    () =>
      debounce((scene) => {
        saveScene(scene)
          .then(() => setStatus("Saved in this browser"))
          .catch(() => setStatus("Local autosave unavailable"));
      }, 600),
    [],
  );

  const handleChange = useCallback(
    (elements, appState, files) => {
      setStatus("Saving…");
      persist({ elements, appState, files });
    },
    [persist],
  );

  if (!initialData) {
    return <main className="loading">Loading your scratchpad…</main>;
  }

  return (
    <main className="app">
      <a className="scratchpad-badge" href="/#/ideas/index">
        <span>Marc’s scratchpad</span>
        <small>{status}</small>
      </a>
      <section className="editor" aria-label="Personal whiteboard">
        <Excalidraw
          initialData={initialData}
          onChange={handleChange}
          UIOptions={{
            canvasActions: {
              loadScene: true,
              export: { saveFileToDisk: true },
              saveAsImage: true,
              toggleTheme: true,
            },
          }}
        />
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Add focused responsive styling**

Create `whiteboard/src/styles.css`:

```css
:root {
  color-scheme: light dark;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#root,
.app,
.editor {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.loading {
  min-height: 100%;
  display: grid;
  place-items: center;
  background: #f5f5f3;
  color: #34343a;
}

.scratchpad-badge {
  position: fixed;
  right: 0.75rem;
  bottom: 0.75rem;
  z-index: 10;
  display: grid;
  gap: 0.1rem;
  max-width: min(13rem, calc(100vw - 1.5rem));
  padding: 0.55rem 0.7rem;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-radius: 0.65rem;
  background: color-mix(in srgb, Canvas 88%, transparent);
  color: CanvasText;
  text-decoration: none;
  backdrop-filter: blur(10px);
}

.scratchpad-badge span {
  font-size: 0.78rem;
  font-weight: 650;
}

.scratchpad-badge small {
  overflow: hidden;
  font-size: 0.65rem;
  opacity: 0.65;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scratchpad-badge:focus-visible {
  outline: 3px solid #6965db;
  outline-offset: 3px;
}

@media (max-width: 600px) {
  .scratchpad-badge {
    right: 0.5rem;
    bottom: 0.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}

@media (prefers-color-scheme: dark) {
  .loading {
    background: #121216;
    color: #f4f4f5;
  }
}
```

- [ ] **Step 4: Run automated verification and inspect bundle paths**

Run:

```bash
cd whiteboard
npm test
npm run build
rg 'src="/draw/|href="/draw/' ../docs/draw/index.html
```

Expected: tests pass, Vite build exits 0, and generated asset paths begin with
`/draw/`.

- [ ] **Step 5: Commit the application and generated output**

```bash
git add whiteboard docs/draw
git commit -m "Build the Excalidraw personal whiteboard"
```

### Task 3: Integrate navigation and perform browser verification

**Files:**
- Modify: `docs/_sidebar.md:1-5`
- Rebuild: `docs/draw/**` only if browser verification finds a defect.

**Interfaces:**
- Produces: a Docsify link with `':ignore'` so `/draw/` bypasses the hash router.

- [ ] **Step 1: Add the real-path sidebar entry**

Insert after Ideas in `docs/_sidebar.md`:

```markdown
* [Whiteboard](/draw/ ':ignore')
```

- [ ] **Step 2: Serve the Pages root locally**

Run:

```bash
python3 -m http.server 4173 --directory docs
```

Expected: a server listens on `http://localhost:4173`.

- [ ] **Step 3: Verify desktop behavior in a browser**

At `http://localhost:4173/draw/`:

1. Confirm there are no page or console errors.
2. Draw a rectangle, arrow, text label, and freehand stroke.
3. Reload and confirm all four objects return.
4. Export `.excalidraw`.
5. Clear the canvas, import the exported file, and confirm all four objects
   return.
6. Export PNG or SVG.
7. Activate `Marc’s scratchpad` and confirm `/#/ideas/index` opens.

- [ ] **Step 4: Verify mobile layout**

Resize to 390 × 844. Confirm the editor fills the viewport, the toolbar remains
usable, and the scratchpad badge does not cover primary controls.

- [ ] **Step 5: Verify the Docsify navigation link**

Open `http://localhost:4173/`, activate Whiteboard, and confirm the browser
navigates to `/draw/`, not `/#/draw/`.

- [ ] **Step 6: Run final checks and commit navigation**

Run:

```bash
cd whiteboard
npm test
npm run build
cd ..
git status --short
```

Expected: tests and build pass; only the expected sidebar/generated changes
remain.

Commit:

```bash
git add docs/_sidebar.md docs/draw
git commit -m "Link the personal whiteboard from the Pages sidebar"
```

- [ ] **Step 7: Push and verify production**

Push `master` using the configured GitHub SSH key, then open:

`https://imarchuang.github.io/draw/`

Confirm HTTP 200, editor load, drawing, reload persistence, and the Ideas
return link. Report that scenes remain browser-local and provide the live URL.
