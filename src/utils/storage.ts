import type {
  GameSaveSchemaV1,
  FinancialStats,
  StoreProgression,
  Product,
  StaffMember,
  Upgrade,
  Achievement,
  StoreDecoration,
} from '../types/game';
import {
  INITIAL_STATS,
  INITIAL_PROGRESSION,
  INITIAL_PRODUCTS,
  INITIAL_STAFF,
  INITIAL_UPGRADES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_DECORATIONS,
} from '../data/initialData';

const SAVE_KEY = 'TINY_MART_TYCOON_SAVE_V1';

export function saveGame(saveData: Omit<GameSaveSchemaV1, 'version' | 'timestamp'>): boolean {
  try {
    const fullSave: GameSaveSchemaV1 = {
      version: 1,
      timestamp: Date.now(),
      stats: sanitizeStats(saveData.stats),
      progression: sanitizeProgression(saveData.progression),
      products: saveData.products,
      staff: saveData.staff,
      upgrades: saveData.upgrades,
      achievements: saveData.achievements,
      decorations: saveData.decorations || INITIAL_DECORATIONS,
      hasCompletedTutorial: saveData.hasCompletedTutorial,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(fullSave));
    return true;
  } catch (err) {
    console.error('Failed to save game to localStorage:', err);
    return false;
  }
}

export function loadGame(): GameSaveSchemaV1 | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    if (parsed.version === 1) {
      return {
        version: 1,
        timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
        stats: sanitizeStats(parsed.stats),
        progression: sanitizeProgression(parsed.progression),
        products: mergeProducts(parsed.products),
        staff: mergeStaff(parsed.staff),
        upgrades: mergeUpgrades(parsed.upgrades),
        achievements: mergeAchievements(parsed.achievements),
        decorations: mergeDecorations(parsed.decorations),
        hasCompletedTutorial: Boolean(parsed.hasCompletedTutorial),
      };
    }
    return null;
  } catch (err) {
    console.error('Failed to load save from localStorage:', err);
    return null;
  }
}

export function clearGameSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    console.error('Failed to clear save:', err);
  }
}

export function exportSaveString(saveData: GameSaveSchemaV1): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(saveData))));
}

export function importSaveString(encoded: string): GameSaveSchemaV1 | null {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    const parsed = JSON.parse(decoded);
    if (parsed && parsed.version === 1) {
      return {
        version: 1,
        timestamp: parsed.timestamp || Date.now(),
        stats: sanitizeStats(parsed.stats),
        progression: sanitizeProgression(parsed.progression),
        products: mergeProducts(parsed.products),
        staff: mergeStaff(parsed.staff),
        upgrades: mergeUpgrades(parsed.upgrades),
        achievements: mergeAchievements(parsed.achievements),
        decorations: mergeDecorations(parsed.decorations),
        hasCompletedTutorial: Boolean(parsed.hasCompletedTutorial),
      };
    }
    return null;
  } catch (err) {
    console.error('Failed to parse imported save:', err);
    return null;
  }
}

function sanitizeNumber(val: unknown, fallback: number): number {
  if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
    return fallback;
  }
  return val;
}

function sanitizeStats(stats: Partial<FinancialStats> | undefined): FinancialStats {
  if (!stats) return { ...INITIAL_STATS };
  return {
    cash: Math.max(0, sanitizeNumber(stats.cash, INITIAL_STATS.cash)),
    totalRevenue: Math.max(0, sanitizeNumber(stats.totalRevenue, 0)),
    totalCogs: Math.max(0, sanitizeNumber(stats.totalCogs, 0)),
    totalSalaries: Math.max(0, sanitizeNumber(stats.totalSalaries, 0)),
    totalUpgrades: Math.max(0, sanitizeNumber(stats.totalUpgrades, 0)),
    netProfit: sanitizeNumber(stats.netProfit, 0),
    customersServed: Math.max(0, Math.floor(sanitizeNumber(stats.customersServed, 0))),
    customersWalkedAway: Math.max(0, Math.floor(sanitizeNumber(stats.customersWalkedAway, 0))),
    vipCustomersServed: Math.max(0, Math.floor(sanitizeNumber(stats.vipCustomersServed, 0))),
    totalTipsEarned: Math.max(0, Math.floor(sanitizeNumber(stats.totalTipsEarned, 0))),
    itemsSold: {
      ...INITIAL_STATS.itemsSold,
      ...(stats.itemsSold || {}),
    },
  };
}

function sanitizeProgression(prog: Partial<StoreProgression> | undefined): StoreProgression {
  if (!prog) return { ...INITIAL_PROGRESSION };
  return {
    storeName: typeof prog.storeName === 'string' && prog.storeName ? prog.storeName : INITIAL_PROGRESSION.storeName,
    level: Math.max(1, Math.floor(sanitizeNumber(prog.level, 1))),
    xp: Math.max(0, sanitizeNumber(prog.xp, 0)),
    xpToNextLevel: Math.max(50, sanitizeNumber(prog.xpToNextLevel, 100)),
    day: Math.max(1, Math.floor(sanitizeNumber(prog.day, 1))),
    timeOfDay: Math.min(24, Math.max(0, sanitizeNumber(prog.timeOfDay, 9.0))),
    isPaused: false,
    gameSpeed: 1,
    prestigeStars: Math.max(0, Math.floor(sanitizeNumber(prog.prestigeStars, 0))),
  };
}

function mergeProducts(savedProducts: Product[] | undefined): Product[] {
  if (!Array.isArray(savedProducts)) return INITIAL_PRODUCTS;
  return INITIAL_PRODUCTS.map((initProd) => {
    const saved = savedProducts.find((p) => p.id === initProd.id);
    if (!saved) return initProd;
    return {
      ...initProd,
      stock: Math.min(saved.maxCapacity || initProd.maxCapacity, Math.max(0, sanitizeNumber(saved.stock, 0))),
      maxCapacity: Math.max(initProd.maxCapacity, sanitizeNumber(saved.maxCapacity, initProd.maxCapacity)),
      isUnlocked: Boolean(saved.isUnlocked || initProd.isUnlocked),
    };
  });
}

function mergeStaff(savedStaff: StaffMember[] | undefined): StaffMember[] {
  if (!Array.isArray(savedStaff)) return INITIAL_STAFF;
  return INITIAL_STAFF.map((initStaff) => {
    const saved = savedStaff.find((s) => s.id === initStaff.id);
    if (!saved) return initStaff;
    return {
      ...initStaff,
      hired: Boolean(saved.hired),
      level: Math.max(1, sanitizeNumber(saved.level, 1)),
      workSpeed: Math.max(1.0, sanitizeNumber(saved.workSpeed, 1.0)),
      active: saved.active !== undefined ? Boolean(saved.active) : true,
    };
  });
}

function mergeUpgrades(savedUpgrades: Upgrade[] | undefined): Upgrade[] {
  if (!Array.isArray(savedUpgrades)) return INITIAL_UPGRADES;
  return INITIAL_UPGRADES.map((initUpg) => {
    const saved = savedUpgrades.find((u) => u.id === initUpg.id);
    if (!saved) return initUpg;
    return {
      ...initUpg,
      level: Math.min(initUpg.maxLevel, Math.max(0, sanitizeNumber(saved.level, 0))),
    };
  });
}

function mergeAchievements(savedAchievements: Achievement[] | undefined): Achievement[] {
  if (!Array.isArray(savedAchievements)) return INITIAL_ACHIEVEMENTS;
  return INITIAL_ACHIEVEMENTS.map((initAch) => {
    const saved = savedAchievements.find((a) => a.id === initAch.id);
    if (!saved) return initAch;
    return {
      ...initAch,
      isUnlocked: Boolean(saved.isUnlocked),
      progress: Math.min(initAch.maxProgress, Math.max(0, sanitizeNumber(saved.progress, 0))),
    };
  });
}

function mergeDecorations(savedDecorations: StoreDecoration[] | undefined): StoreDecoration[] {
  if (!Array.isArray(savedDecorations)) return INITIAL_DECORATIONS;
  return INITIAL_DECORATIONS.map((initDec) => {
    const saved = savedDecorations.find((d) => d.id === initDec.id);
    if (!saved) return initDec;
    return {
      ...initDec,
      isPurchased: Boolean(saved.isPurchased),
    };
  });
}
