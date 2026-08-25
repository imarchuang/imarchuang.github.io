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
