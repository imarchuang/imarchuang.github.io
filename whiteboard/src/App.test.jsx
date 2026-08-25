// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { navigateTo } from "./navigation";
import * as persistence from "./persistence";

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

    expect(persistence.saveScene).toHaveBeenCalledTimes(1);
    expect(navigateTo).not.toHaveBeenCalled();

    resolveSave();

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(navigateTo).toHaveBeenCalledWith(
      expect.stringMatching(/\/#\/ideas\/index$/),
    );
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
  });

  it("updates with system theme changes only when no explicit theme is restored", async () => {
    vi.mocked(persistence.loadScene).mockResolvedValue({
      elements: [],
      appState: {},
      files: {},
    });

    render(<App />);
    await screen.findByTestId("excalidraw");

    emitSystemTheme("dark");

    await waitFor(() => {
      expect(excalidrawApi.updateScene).toHaveBeenCalledWith({
        appState: { theme: "dark" },
      });
    });
  });

  it("preserves an explicitly restored theme across system theme changes", async () => {
    vi.mocked(persistence.loadScene).mockResolvedValue({
      elements: [],
      appState: { theme: "dark" },
      files: {},
    });

    render(<App />);
    await screen.findByTestId("excalidraw");

    emitSystemTheme("light");

    expect(excalidrawApi.updateScene).not.toHaveBeenCalled();
  });
});
