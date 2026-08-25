import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearScene,
  debounce,
  loadScene,
  saveScene,
  selectPersistedAppState,
} from "./persistence";

const DB_NAME = "marc-personal-whiteboard";
const STORE_NAME = "scenes";
const CURRENT_SCENE = "current";

function putRawScene(scene) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.put(scene, CURRENT_SCENE);
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    };
    request.onerror = () => reject(request.error);
  });
}

describe("scene persistence", () => {
  beforeEach(async () => {
    await clearScene();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it("returns null for malformed persisted scene data", async () => {
    await putRawScene({
      elements: "not-an-array",
      appState: { theme: "dark" },
      files: {},
    });

    expect(await loadScene()).toBeNull();
  });

  it("returns null when persisted elements contain non-object entries", async () => {
    await putRawScene({
      elements: [{ id: "box" }, "bad-entry", null],
      appState: { theme: "dark" },
      files: {},
    });

    expect(await loadScene()).toBeNull();
  });

  it("returns null when persisted elements are malformed objects", async () => {
    const malformedElements = [
      {},
      [],
      new Date(),
      { type: "rectangle" },
      { id: "box" },
      { id: "", type: "rectangle" },
      { id: "box", type: "" },
    ];

    for (const element of malformedElements) {
      await putRawScene({
        elements: [element],
        appState: { theme: "dark" },
        files: {},
      });

      expect(await loadScene()).toBeNull();
      await clearScene();
    }
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

  it("debounces writes", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const run = debounce(fn, 250);
    run("first");
    run("second");
    await vi.advanceTimersByTimeAsync(250);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("second");
  });

  it("flushes the latest pending call immediately", async () => {
    vi.useFakeTimers();
    const fn = vi.fn().mockResolvedValue("saved");
    const run = debounce(fn, 250);

    run("first");
    const pending = run("second");
    const flushed = run.flush();

    await expect(flushed).resolves.toBe("saved");
    await expect(pending).resolves.toBe("saved");
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("second");
  });

  it("rejects when IndexedDB is unavailable", async () => {
    const originalIndexedDB = globalThis.indexedDB;
    Reflect.deleteProperty(globalThis, "indexedDB");

    await expect(loadScene()).rejects.toThrow();

    globalThis.indexedDB = originalIndexedDB;
  });
});
