# Personal whiteboard design

## Goal

Add a private-to-the-browser drafting surface to the existing public GitHub
Pages site at `https://imarchuang.github.io/draw/`. It should provide the full
Excalidraw editing experience without requiring an account or backend service.

## Scope

The first version includes:

- The full Excalidraw editor: freehand drawing, shapes, arrows, text, images,
  selection, undo/redo, zoom, and canvas navigation.
- Automatic local persistence in IndexedDB.
- Import and export of `.excalidraw` files.
- PNG and SVG export through Excalidraw's standard controls.
- Light and dark themes following the operating-system preference.
- A link back to the Ideas section.
- A Whiteboard entry in the Docsify sidebar.

The first version excludes:

- Real-time collaboration.
- Server-side or GitHub-backed scene storage.
- Cross-device synchronization.
- Authentication and access control.
- A gallery or history of multiple saved scenes.

The page and repository are public. The drawing data remains only in the
current browser unless the user explicitly exports a file.

## Architecture

Create a small Vite and React application in `whiteboard/`. It imports the
official `@excalidraw/excalidraw` package and adds only the site-specific shell
and persistence behavior.

Vite builds the application with `/draw/` as its base path. The generated
static files are committed to `docs/draw/`, which is already within the
GitHub Pages publishing root. GitHub Actions and a server runtime are not
required.

The repository stores both source and generated output:

```text
whiteboard/
  package.json
  package-lock.json
  index.html
  src/
    App.jsx
    persistence.js
    styles.css
docs/
  draw/
    index.html
    assets/...
```

## Components

### Application shell

The shell fills the viewport and gives the editor all remaining space. A small,
quiet navigation control returns to `/#/ideas/index`. It must not obstruct
Excalidraw's own toolbar or menus.

### Excalidraw editor

Use the official React component rather than recreating drawing behavior.
Standard Excalidraw menus provide scene loading, scene export, and image
export. The application does not expose collaboration controls.

### Local persistence

Store a single current scene in IndexedDB under a versioned database and key.
The value contains elements, the safe subset of app state required to restore
the scene, and embedded files.

The editor's change callback schedules a debounced write. On startup, the
application loads the saved scene and supplies it as Excalidraw initial data.
If no scene exists, it starts empty.

Persistence failures must not prevent drawing. They are reported with a short
non-blocking status message. Invalid or incompatible stored data is ignored,
leaving the editor usable.

## Data flow

1. The browser opens `/draw/`.
2. The app reads the current scene from IndexedDB.
3. The app mounts Excalidraw with the restored scene or an empty scene.
4. Drawing changes trigger a debounced IndexedDB write.
5. Manual import replaces the active scene through Excalidraw.
6. Manual export downloads data without uploading it anywhere.

## Visual direction

Excalidraw remains visually dominant and familiar. The site-specific shell is
minimal and uses neutral colors derived from the active theme. The sole custom
signature is a compact `Marc's scratchpad` return badge positioned away from
the editor controls. It communicates ownership and navigation without turning
the whiteboard into a branded landing page.

The layout must fill desktop and mobile viewports, preserve keyboard focus
visibility, and respect reduced-motion preferences.

## Verification

Before publishing:

1. Install dependencies from the lockfile and complete a production build.
2. Serve the generated `docs/` directory locally.
3. Confirm `/draw/` loads without console errors.
4. Draw multiple object types and confirm normal editor interactions.
5. Reload and confirm the scene is restored from IndexedDB.
6. Export an `.excalidraw` file, clear the scene, import it, and confirm the
   scene returns.
7. Export PNG or SVG.
8. Check the page at a mobile viewport.
9. Confirm the Docsify Whiteboard link opens the real `/draw/` path rather than
   a hash route.

## Delivery

Commit the source, lockfile, generated `docs/draw/` output, and sidebar link to
`master`, then push to GitHub. The live URL is:

`https://imarchuang.github.io/draw/`
