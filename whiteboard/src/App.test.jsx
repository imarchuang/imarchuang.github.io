// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { navigateTo } from "./navigation";
import * as persistence from "./persistence";
import { THEME_PREFERENCE } from "./theme";

let excalidrawApi;
let onChangeHandler;
let mediaQueryList;
const mediaQueryListeners = new Set();

vi.mock("@excalidraw/excalidraw", () => ({
  Excalidraw: ({ excalidrawAPI, initialData, onChange }) => {
    onChangeHandler = onChange;
    excalidrawApi ||= { updateScene: vi.fn() };
    excalidrawAPI?.(excalidrawApi);

    return (
      <div
        data-testid="excalidraw"
        data-elements={String(initialData.elements.length)}
        data-theme={initialData.appState.theme}
      />
    );
  },
}));

vi.mock("./persistence", async () => {
  const actual = await vi.importActual("./persistence");
  return {
    ...actual,
    loadScene: vi.fn(),
    saveScene: vi.fn(),
  };
});

vi.mock("./navigation", () => ({
  navigateTo: vi.fn(),
}));

function setSystemTheme(theme) {
  mediaQueryList.matches = theme === "dark";
}

function emitSystemTheme(theme) {
  setSystemTheme(theme);
  mediaQueryListeners.forEach((listener) =>
    listener({ matches: mediaQueryList.matches }),
  );
}

describe("App", () => {
  beforeEach(() => {
    excalidrawApi = undefined;
    onChangeHandler = undefined;
    mediaQueryListeners.clear();
    mediaQueryList = {
      matches: false,
      addEventListener: vi.fn((eventName, listener) => {
        if (eventName === "change") {
          mediaQueryListeners.add(listener);
        }
      }),
      removeEventListener: vi.fn((eventName, listener) => {
        if (eventName === "change") {
          mediaQueryListeners.delete(listener);
        }
      }),
    };

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn(() => mediaQueryList),
    });

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });

    vi.mocked(persistence.loadScene).mockResolvedValue(null);
    vi.mocked(persistence.saveScene).mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("initializes an empty scene with the system dark theme", async () => {
    setSystemTheme("dark");

    render(<App />);

    expect(
      (await screen.findByTestId("excalidraw")).getAttribute("data-theme"),
    ).toBe("dark");
  });

  it("initializes an empty scene with the system light theme", async () => {
    setSystemTheme("light");

    render(<App />);

    expect(
      (await screen.findByTestId("excalidraw")).getAttribute("data-theme"),
    ).toBe("light");
  });

  it("renders an empty editor when loading local data fails", async () => {
    vi.mocked(persistence.loadScene).mockRejectedValue(new Error("IndexedDB unavailable"));

    render(<App />);

    const editor = await screen.findByTestId("excalidraw");
    expect(editor.getAttribute("data-elements")).toBe("0");
    expect(screen.getByText("Local autosave unavailable")).toBeTruthy();
  });

  it("shows unavailable status for a rejected scheduled save without an unhandled rejection", async () => {
    const unhandledRejection = vi.fn((event) => event.preventDefault());
    window.addEventListener("unhandledrejection", unhandledRejection);
    vi.mocked(persistence.saveScene).mockRejectedValue(new Error("save failed"));

    render(<App />);
    await screen.findByTestId("excalidraw");
    vi.useFakeTimers();

    onChangeHandler([{ id: "box", type: "rectangle" }], { theme: "light" }, {});
    await vi.advanceTimersByTimeAsync(600);
    await Promise.resolve();
    await Promise.resolve();

    expect(screen.getByText("Local autosave unavailable")).toBeTruthy();
    expect(unhandledRejection).not.toHaveBeenCalled();

    window.removeEventListener("unhandledrejection", unhandledRejection);
  });

  it("flushes a pending save before navigating away", async () => {
    let resolveSave;
    vi.mocked(persistence.saveScene).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSave = resolve;
        }),
    );

    render(<App />);
    await screen.findByTestId("excalidraw");
    vi.useFakeTimers();

    onChangeHandler([{ id: "box", type: "rectangle" }], { theme: "light" }, {});
    fireEvent.click(screen.getByText("Marc's scratchpad"));

    await Promise.resolve();
    await Promise.resolve();

    expect(persistence.saveScene.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(navigateTo).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1000);
    expect(navigateTo).not.toHaveBeenCalled();

    vi.useRealTimers();
    resolveSave();

    await waitFor(() => {
      expect(navigateTo).toHaveBeenCalledWith(
        expect.stringMatching(/\/#\/ideas\/index$/),
      );
    });
  });

  it("flushes a pending save when the page becomes hidden", async () => {
    render(<App />);
    await screen.findByTestId("excalidraw");
    vi.useFakeTimers();

    onChangeHandler([{ id: "box", type: "rectangle" }], { theme: "light" }, {});

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));

    await Promise.resolve();
    await Promise.resolve();

    expect(persistence.saveScene.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(persistence.saveScene).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { themePreference: THEME_PREFERENCE.SYSTEM },
      }),
    );
  });

  it("restores system-following scenes with the current OS theme and keeps following changes", async () => {
    vi.mocked(persistence.loadScene).mockResolvedValue({
      elements: [],
      appState: { theme: "light" },
      files: {},
      metadata: { themePreference: THEME_PREFERENCE.SYSTEM },
    });
    setSystemTheme("dark");

    render(<App />);

    expect(
      (await screen.findByTestId("excalidraw")).getAttribute("data-theme"),
    ).toBe("dark");

    emitSystemTheme("light");

    await waitFor(() => {
      expect(excalidrawApi.updateScene).toHaveBeenCalledWith({
        appState: { theme: "light" },
      });
    });
  });

  it("treats legacy scenes with a stored theme as explicit after reload", async () => {
    vi.mocked(persistence.loadScene).mockResolvedValue({
      elements: [],
      appState: { theme: "dark" },
      files: {},
    });
    setSystemTheme("light");

    render(<App />);

    expect(
      (await screen.findByTestId("excalidraw")).getAttribute("data-theme"),
    ).toBe("dark");

    emitSystemTheme("light");

    expect(excalidrawApi.updateScene).not.toHaveBeenCalled();
  });

  it("persists an explicit theme preference after a user toggle", async () => {
    render(<App />);
    await screen.findByTestId("excalidraw");
    vi.useFakeTimers();

    onChangeHandler([{ id: "box", type: "rectangle" }], { theme: "dark" }, {});

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));

    await Promise.resolve();
    await Promise.resolve();

    expect(persistence.saveScene).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: { themePreference: THEME_PREFERENCE.EXPLICIT },
      }),
    );
  });
});
