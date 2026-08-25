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
  const [status, setStatus] = useState("Loading local sketch...");

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
      setStatus("Saving...");
      persist({ elements, appState, files });
    },
    [persist],
  );

  if (!initialData) {
    return <main className="loading">Loading your scratchpad...</main>;
  }

  return (
    <main className="app">
      <a className="scratchpad-badge" href="/#/ideas/index">
        <span>Marc&apos;s scratchpad</span>
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
