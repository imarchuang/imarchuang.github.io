import { Excalidraw } from "@excalidraw/excalidraw";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { navigateTo } from "./navigation";
import { debounce, loadScene, saveScene } from "./persistence";
import {
  DARK_MEDIA_QUERY,
  getSystemTheme,
  isThemePreference,
  THEME_PREFERENCE,
} from "./theme";

function createEmptyScene(theme = getSystemTheme()) {
  return {
    elements: [],
    appState: { theme },
    files: {},
    metadata: { themePreference: THEME_PREFERENCE.SYSTEM },
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

function setThemePreference(scene, themePreference) {
  return {
    ...scene,
    metadata: {
      ...scene.metadata,
      themePreference,
    },
  };
}

function getThemePreference(scene) {
  if (isThemePreference(scene?.metadata?.themePreference)) {
    return scene.metadata.themePreference;
  }

  // Legacy scenes stored the effective theme but not whether it was explicit.
  return scene?.appState?.theme
    ? THEME_PREFERENCE.EXPLICIT
    : THEME_PREFERENCE.SYSTEM;
}

export default function App() {
  const [initialData, setInitialData] = useState(null);
  const [status, setStatus] = useState("Loading local sketch...");
  const excalidrawApiRef = useRef(null);
  const latestSceneRef = useRef(null);
  const themePreferenceRef = useRef(THEME_PREFERENCE.SYSTEM);

  useEffect(() => {
    loadScene()
      .then((scene) => {
        const theme = getSystemTheme();
        const themePreference = scene
          ? getThemePreference(scene)
          : THEME_PREFERENCE.SYSTEM;
        const baseScene = scene
          ? setThemePreference(scene, themePreference)
          : createEmptyScene(theme);
        const nextScene =
          themePreference === THEME_PREFERENCE.SYSTEM
            ? applyTheme(baseScene, theme)
            : baseScene.appState.theme
              ? baseScene
              : applyTheme(baseScene, theme);

        themePreferenceRef.current = themePreference;
        latestSceneRef.current = nextScene;
        setInitialData(nextScene);
        setStatus(scene ? "Restored locally" : "Saved in this browser");
      })
      .catch(() => {
        const fallbackScene = createEmptyScene();
        themePreferenceRef.current = THEME_PREFERENCE.SYSTEM;
        latestSceneRef.current = fallbackScene;
        setInitialData(fallbackScene);
        setStatus("Local autosave unavailable");
      });
  }, []);

  const persist = useMemo(
    () =>
      debounce((scene) => {
        return saveScene(scene)
          .then(() => setStatus("Saved in this browser"))
          .catch((error) => {
            setStatus("Local autosave unavailable");
            throw error;
          });
      }, 600),
    [],
  );

  const excalidrawUIOptions = useMemo(
    () => ({
      canvasActions: {
        loadScene: true,
        export: { saveFileToDisk: true },
        saveAsImage: true,
        toggleTheme: true,
      },
    }),
    [],
  );

  const captureExcalidrawAPI = useCallback((api) => {
    excalidrawApiRef.current = api;
  }, []);

  const handleChange = useCallback(
    (elements, appState, files) => {
      let themePreference = themePreferenceRef.current;

      if (
        themePreference === THEME_PREFERENCE.SYSTEM &&
        appState.theme &&
        appState.theme !== getSystemTheme()
      ) {
        themePreference = THEME_PREFERENCE.EXPLICIT;
        themePreferenceRef.current = themePreference;
      }

      const scene = setThemePreference(
        { elements, appState, files },
        themePreference,
      );
      latestSceneRef.current = scene;
      setStatus("Saving...");
      void persist(scene).catch(() => {});
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
      if (themePreferenceRef.current !== THEME_PREFERENCE.SYSTEM) {
        return;
      }

      const theme = mediaQuery.matches ? "dark" : "light";
      const currentScene =
        latestSceneRef.current || createEmptyScene(theme);
      const themedScene = setThemePreference(
        applyTheme(currentScene, theme),
        THEME_PREFERENCE.SYSTEM,
      );

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
          excalidrawAPI={captureExcalidrawAPI}
          initialData={initialData}
          onChange={handleChange}
          UIOptions={excalidrawUIOptions}
        />
      </section>
    </main>
  );
}
