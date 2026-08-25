import { Excalidraw } from "@excalidraw/excalidraw";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { navigateTo } from "./navigation";
import { debounce, loadScene, saveScene } from "./persistence";
import { DARK_MEDIA_QUERY, getSystemTheme } from "./theme";

function createEmptyScene(theme = getSystemTheme()) {
  return {
    elements: [],
    appState: { theme },
    files: {},
  };
}

function applyTheme(scene, theme) {
  return {
    ...scene,
    appState: {
      ...scene.appState,
      theme,
    },
  };
}

export default function App() {
  const [initialData, setInitialData] = useState(null);
  const [status, setStatus] = useState("Loading local sketch...");
  const excalidrawApiRef = useRef(null);
  const latestSceneRef = useRef(null);
  const themePreferenceRef = useRef("system");

  useEffect(() => {
    loadScene()
      .then((scene) => {
        const theme = getSystemTheme();
        const nextScene = scene
          ? scene.appState.theme
            ? scene
            : applyTheme(scene, theme)
          : createEmptyScene(theme);

        themePreferenceRef.current = scene?.appState.theme ? "explicit" : "system";
        latestSceneRef.current = nextScene;
        setInitialData(nextScene);
        setStatus(scene ? "Restored locally" : "Saved in this browser");
      })
      .catch(() => {
        const fallbackScene = createEmptyScene();
        themePreferenceRef.current = "system";
        latestSceneRef.current = fallbackScene;
        setInitialData(fallbackScene);
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
      const scene = { elements, appState, files };
      latestSceneRef.current = scene;

      if (
        themePreferenceRef.current === "system" &&
        appState.theme &&
        appState.theme !== getSystemTheme()
      ) {
        themePreferenceRef.current = "explicit";
      }

      setStatus("Saving...");
      persist(scene);
    },
    [persist],
  );

  const flushPendingSave = useCallback(async () => {
    if (!persist.pending()) {
      return;
    }

    try {
      await persist.flush();
    } catch {
      setStatus("Local autosave unavailable");
    }
  }, [persist]);

  useEffect(() => {
    const handlePageHide = () => {
      void flushPendingSave();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void flushPendingSave();
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [flushPendingSave]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(DARK_MEDIA_QUERY);
    const applySystemTheme = () => {
      if (themePreferenceRef.current !== "system") {
        return;
      }

      const theme = mediaQuery.matches ? "dark" : "light";
      const currentScene =
        latestSceneRef.current || createEmptyScene(theme);
      const themedScene = applyTheme(currentScene, theme);

      latestSceneRef.current = themedScene;
      setInitialData((previousScene) =>
        previousScene ? applyTheme(previousScene, theme) : previousScene,
      );
      excalidrawApiRef.current?.updateScene({
        appState: { theme },
      });
    };

    mediaQuery.addEventListener("change", applySystemTheme);
    return () => mediaQuery.removeEventListener("change", applySystemTheme);
  }, []);

  const handleScratchpadClick = useCallback(
    async (event) => {
      event.preventDefault();
      const { href } = event.currentTarget;
      await flushPendingSave();
      navigateTo(href);
    },
    [flushPendingSave],
  );

  if (!initialData) {
    return <main className="loading">Loading your scratchpad...</main>;
  }

  return (
    <main className="app">
      <a
        className="scratchpad-badge"
        href="/#/ideas/index"
        onClick={(event) => {
          void handleScratchpadClick(event);
        }}
      >
        <span>Marc&apos;s scratchpad</span>
        <small>{status}</small>
      </a>
      <section className="editor" aria-label="Personal whiteboard">
        <Excalidraw
          excalidrawAPI={(api) => {
            excalidrawApiRef.current = api;
          }}
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
