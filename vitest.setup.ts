import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * Node の experimental Web Storage や一部環境では jsdom の localStorage が
 * Storage 仕様どおりでないことがある。不足しているときだけメモリ実装を差し込む。
 */
function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  } as Storage;
}

function isLocalStorageUsable(): boolean {
  try {
    const ls = window.localStorage;
    return (
      typeof ls?.clear === "function" &&
      typeof ls?.removeItem === "function" &&
      typeof ls?.getItem === "function" &&
      typeof ls?.setItem === "function"
    );
  } catch {
    return false;
  }
}

beforeEach(() => {
  if (!isLocalStorageUsable()) {
    Object.defineProperty(window, "localStorage", {
      value: createMemoryStorage(),
      writable: true,
      configurable: true,
    });
  }
});

afterEach(() => {
  cleanup();
});
