import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveGame,
  loadGame,
  clearGameSave,
  exportSaveString,
  importSaveString,
} from '../src/utils/storage';
import {
  INITIAL_STATS,
  INITIAL_PROGRESSION,
  INITIAL_PRODUCTS,
  INITIAL_STAFF,
  INITIAL_UPGRADES,
  INITIAL_ACHIEVEMENTS,
} from '../src/data/initialData';
import type { GameSaveSchemaV1 } from '../src/types/game';

// In-memory mock for localStorage in Node test environment
const storageMap = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => {
    storageMap.set(key, String(value));
  },
  removeItem: (key: string) => {
    storageMap.delete(key);
  },
  clear: () => {
    storageMap.clear();
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Storage & Migration System', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('saves and loads game state with versioned schema', () => {
    const customStats = { ...INITIAL_STATS, cash: 777 };
    saveGame({
      stats: customStats,
      progression: INITIAL_PROGRESSION,
      products: INITIAL_PRODUCTS,
      staff: INITIAL_STAFF,
      upgrades: INITIAL_UPGRADES,
      achievements: INITIAL_ACHIEVEMENTS,
      hasCompletedTutorial: true,
    });

    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded?.version).toBe(1);
    expect(loaded?.stats.cash).toBe(777);
    expect(loaded?.hasCompletedTutorial).toBe(true);
  });

  it('clears game save correctly', () => {
    saveGame({
      stats: INITIAL_STATS,
      progression: INITIAL_PROGRESSION,
      products: INITIAL_PRODUCTS,
      staff: INITIAL_STAFF,
      upgrades: INITIAL_UPGRADES,
      achievements: INITIAL_ACHIEVEMENTS,
      hasCompletedTutorial: false,
    });
    expect(loadGame()).not.toBeNull();
    clearGameSave();
    expect(loadGame()).toBeNull();
  });

  it('exports to base64 string and imports back accurately', () => {
    const fullSave: GameSaveSchemaV1 = {
      version: 1,
      timestamp: Date.now(),
      stats: { ...INITIAL_STATS, cash: 1234 },
      progression: { ...INITIAL_PROGRESSION, level: 3 },
      products: INITIAL_PRODUCTS,
      staff: INITIAL_STAFF,
      upgrades: INITIAL_UPGRADES,
      achievements: INITIAL_ACHIEVEMENTS,
      hasCompletedTutorial: true,
    };

    const encoded = exportSaveString(fullSave);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(20);

    const imported = importSaveString(encoded);
    expect(imported).not.toBeNull();
    expect(imported?.stats.cash).toBe(1234);
    expect(imported?.progression.level).toBe(3);
  });

  it('handles invalid import strings safely by returning null', () => {
    expect(importSaveString('invalid-gibberish-string')).toBeNull();
    expect(importSaveString('')).toBeNull();
  });
});
