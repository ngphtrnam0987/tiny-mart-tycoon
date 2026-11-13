import { create } from 'zustand';
import confetti from 'canvas-confetti';
import type {
  Product,
  StaffMember,
  Upgrade,
  Achievement,
  FinancialStats,
  StoreProgression,
  Customer,
  FloatingParticle,
  OfflineSummary,
  ProductId,
} from '../types/game';
import {
  INITIAL_PRODUCTS,
  INITIAL_STAFF,
  INITIAL_UPGRADES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_STATS,
  INITIAL_PROGRESSION,
} from '../data/initialData';
import {
  buyStock,
  applySaleToStats,
  calculateUpgradeCost,
} from '../game/economy/economySystem';
import {
  spawnCustomer,
  updateCustomers,
} from '../game/systems/customerSystem';
import {
  performStockerAutomation,
  getCashierSpeedMultiplier,
  calculateStaffSalaries,
} from '../game/systems/staffSystem';
import {
  checkLevelUp,
  evaluateAchievements,
} from '../game/progression/progressionSystem';
import { calculateOfflineProgress } from '../game/economy/offlineEarnings';
import {
  loadGame,
  saveGame,
  clearGameSave,
  exportSaveString,
  importSaveString,
} from '../utils/storage';
import { soundManager } from '../utils/audio';

export type ManagementTab = 'products' | 'staff' | 'upgrades' | 'stats' | 'achievements' | 'settings';

interface GameState {
  stats: FinancialStats;
  progression: StoreProgression;
  products: Product[];
  staff: StaffMember[];
  upgrades: Upgrade[];
  achievements: Achievement[];
  customers: Customer[];
  particles: FloatingParticle[];

  activeTab: ManagementTab;
  isMuted: boolean;
  isMusicPlaying: boolean;
  offlineSummary: OfflineSummary | null;
  tutorialStep: number;
  hasCompletedTutorial: boolean;
  salaryTimer: number;
  stockerTimer: number;
  spawnTimer: number;
  gameTime: number;

  tick: (deltaSeconds: number) => void;
  buyProductStock: (productId: ProductId, amount: number) => boolean;
  unlockProduct: (productId: ProductId) => boolean;
  hireStaff: (staffId: string) => boolean;
  upgradeStaff: (staffId: string) => boolean;
  buyUpgrade: (upgradeId: string) => boolean;
  manualRegisterClick: () => void;
  setActiveTab: (tab: ManagementTab) => void;
  setGameSpeed: (speed: number) => void;
  togglePause: () => void;
  toggleMute: () => void;
  toggleMusic: () => void;
  dismissOfflineModal: () => void;
  advanceTutorial: () => void;
  resetGame: () => void;
  exportSaveData: () => string;
  importSaveData: (code: string) => boolean;
}

function initGame(): {
  stats: FinancialStats;
  progression: StoreProgression;
  products: Product[];
  staff: StaffMember[];
  upgrades: Upgrade[];
  achievements: Achievement[];
  offlineSummary: OfflineSummary | null;
  hasCompletedTutorial: boolean;
} {
  const saved = loadGame();
  if (saved) {
    const offlineResult = calculateOfflineProgress(
      saved.timestamp,
      Date.now(),
      saved.stats,
      saved.products,
      saved.staff,
      saved.upgrades
    );

    return {
      stats: offlineResult.updatedStats,
      progression: saved.progression,
      products: offlineResult.updatedProducts,
      staff: saved.staff,
      upgrades: saved.upgrades,
      achievements: saved.achievements,
      offlineSummary: offlineResult.summary,
      hasCompletedTutorial: saved.hasCompletedTutorial,
    };
  }

  return {
    stats: { ...INITIAL_STATS },
    progression: { ...INITIAL_PROGRESSION },
    products: INITIAL_PRODUCTS.map((p) => ({ ...p })),
    staff: INITIAL_STAFF.map((s) => ({ ...s })),
    upgrades: INITIAL_UPGRADES.map((u) => ({ ...u })),
    achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a })),
    offlineSummary: null,
    hasCompletedTutorial: false,
  };
}

const initial = initGame();

export const useGameStore = create<GameState>((set, get) => ({
  stats: initial.stats,
  progression: initial.progression,
  products: initial.products,
  staff: initial.staff,
  upgrades: initial.upgrades,
  achievements: initial.achievements,
  customers: [],
  particles: [],

  activeTab: 'products',
  isMuted: false,
  isMusicPlaying: false,
  offlineSummary: initial.offlineSummary,
  tutorialStep: initial.hasCompletedTutorial ? 4 : 0,
  hasCompletedTutorial: initial.hasCompletedTutorial,
  salaryTimer: 60,
  stockerTimer: 3,
  spawnTimer: 1.5,
  gameTime: 0,

  tick: (deltaSeconds: number) => {
    const state = get();
    if (state.progression.isPaused) return;

    const effectiveDelta = deltaSeconds * state.progression.gameSpeed;
    let { stats, progression, products, staff, upgrades, achievements, customers, particles } =
      state;
    let { salaryTimer, stockerTimer, spawnTimer, gameTime } = state;

    gameTime += effectiveDelta;

    const attractionUpgrade = upgrades.find((u) => u.id === 'customer_attraction');
    const attractionLevel = attractionUpgrade ? attractionUpgrade.level : 0;
    const scannerUpgrade = upgrades.find((u) => u.id === 'checkout_speed');
    const scannerBonus = scannerUpgrade ? scannerUpgrade.level * scannerUpgrade.effectValue : 0;
    const stockerUpgrade = upgrades.find((u) => u.id === 'stocker_efficiency');
    const stockerUpgradeLevel = stockerUpgrade ? stockerUpgrade.level : 0;
    const staffLoungeUpgrade = upgrades.find((u) => u.id === 'employee_breakroom');
    const staffLoungeLevel = staffLoungeUpgrade ? staffLoungeUpgrade.level : 0;
    const wholesaleUpgrade = upgrades.find((u) => u.id === 'profit_optimization');
    const wholesaleLevel = wholesaleUpgrade ? wholesaleUpgrade.level : 0;

    const manager = staff.find((s) => s.type === 'manager');
    const managerHired = Boolean(manager && manager.hired && manager.active);
    const cashier = staff.find((s) => s.type === 'cashier');
    const cashierMultiplier = getCashierSpeedMultiplier(cashier, managerHired, staffLoungeLevel);

    spawnTimer -= effectiveDelta;
    const maxCustomers = 4 + attractionLevel * 2;
    if (spawnTimer <= 0 && customers.length < maxCustomers) {
      const unlockedProducts = products.filter((p) => p.isUnlocked);
      const newCustomer = spawnCustomer(unlockedProducts);
      if (newCustomer) {
        customers = [...customers, newCustomer];
      }
      const spawnInterval = Math.max(1.2, 4.5 / (1 + attractionLevel * 0.25));
      spawnTimer = spawnInterval + (Math.random() * 0.8 - 0.4);
    }

    const custUpdate = updateCustomers(
      customers,
      products,
      effectiveDelta,
      cashierMultiplier,
      scannerBonus
    );
    customers = custUpdate.updatedCustomers;

    if (custUpdate.result.completedSales.length > 0) {
      for (const sale of custUpdate.result.completedSales) {
        const prod = products.find((p) => p.id === sale.productId);
        if (prod) {
          const saleResult = applySaleToStats(stats, prod, 1, wholesaleLevel);
          stats = saleResult.newStats;
          progression = {
            ...progression,
            xp: progression.xp + Math.max(5, Math.floor(prod.salePrice * 1.5)),
          };
          soundManager.playCashRegister();
        }
      }
    }

    if (custUpdate.result.walkedAway > 0) {
      stats = {
        ...stats,
        customersWalkedAway: stats.customersWalkedAway + custUpdate.result.walkedAway,
      };
    }

    if (custUpdate.result.particles.length > 0) {
      particles = [...particles, ...custUpdate.result.particles];
    }

    stockerTimer -= effectiveDelta;
    const stocker = staff.find((s) => s.type === 'stocker');
    if (stockerTimer <= 0 && stocker && stocker.hired && stocker.active) {
      const stockerResult = performStockerAutomation(
        stocker,
        products,
        stats.cash,
        stockerUpgradeLevel,
        managerHired
      );
      if (stockerResult.restocked.length > 0) {
        stats = {
          ...stats,
          cash: stockerResult.newCash,
          totalCogs: stats.totalCogs + stockerResult.cogsSpent,
        };
        products = stockerResult.updatedProducts;
        soundManager.playRestock();
      }
      stockerTimer = Math.max(1.5, 4.0 - stocker.level * 0.5);
    }

    salaryTimer -= effectiveDelta;
    if (salaryTimer <= 0) {
      const salaryDue = calculateStaffSalaries(staff, 1.0);
      if (salaryDue > 0) {
        const actualDeduction = Math.min(stats.cash, salaryDue);
        stats = {
          ...stats,
          cash: stats.cash - actualDeduction,
          totalSalaries: stats.totalSalaries + actualDeduction,
          netProfit: stats.netProfit - actualDeduction,
        };
      }
      salaryTimer = 60;
    }

    const lvlCheck = checkLevelUp(progression, stats);
    if (lvlCheck.levelUpResult.leveledUp) {
      progression = lvlCheck.updatedProgression;
      stats = lvlCheck.updatedStats;
      soundManager.playLevelUp();
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      particles = [
        ...particles,
        {
          id: `lvl-${Date.now()}`,
          x: 400,
          y: 200,
          text: `Level Up! Level ${progression.level} (+$${lvlCheck.levelUpResult.cashBonus})`,
          color: '#fbbf24',
          opacity: 1.0,
          vy: -40,
          life: 2.0,
        },
      ];
    }

    const achCheck = evaluateAchievements(achievements, stats, progression, staff);
    if (achCheck.newlyUnlocked.length > 0) {
      achievements = achCheck.updatedAchievements;
      stats = {
        ...stats,
        cash: stats.cash + achCheck.bonusCash,
      };
      progression = {
        ...progression,
        xp: progression.xp + achCheck.bonusXp,
      };
      soundManager.playUpgrade();
      confetti({ particleCount: 50, spread: 45 });
      achCheck.newlyUnlocked.forEach((ach) => {
        particles.push({
          id: `ach-${ach.id}-${Date.now()}`,
          x: 400,
          y: 250,
          text: `🏆 Achievement: ${ach.title}! (+$${ach.rewardCash})`,
          color: '#38bdf8',
          opacity: 1.0,
          vy: -30,
          life: 2.5,
        });
      });
    }

    const updatedParticles: FloatingParticle[] = [];
    for (const p of particles) {
      const newLife = p.life - effectiveDelta;
      if (newLife > 0) {
        updatedParticles.push({
          ...p,
          y: p.y + p.vy * effectiveDelta,
          opacity: Math.max(0, newLife / 1.5),
          life: newLife,
        });
      }
    }

    if (Math.floor(gameTime) % 8 === 0 && Math.floor(gameTime - effectiveDelta) % 8 !== 0) {
      saveGame({
        stats,
        progression,
        products,
        staff,
        upgrades,
        achievements,
        hasCompletedTutorial: state.hasCompletedTutorial,
      });
    }

    set({
      stats,
      progression,
      products,
      staff,
      upgrades,
      achievements,
      customers,
      particles: updatedParticles,
      salaryTimer,
      stockerTimer,
      spawnTimer,
      gameTime,
    });
  },

  buyProductStock: (productId: ProductId, amount: number) => {
    const { stats, products, tutorialStep } = get();
    const product = products.find((p) => p.id === productId);
    if (!product) return false;

    const res = buyStock(stats.cash, product, amount);
    if (!res.success) return false;

    const updatedProducts = products.map((p) =>
      p.id === productId ? { ...p, stock: res.newStock } : p
    );

    const updatedStats: FinancialStats = {
      ...stats,
      cash: res.newCash,
      totalCogs: stats.totalCogs + res.totalCost,
    };

    soundManager.playRestock();

    let nextStep = tutorialStep;
    if (tutorialStep === 1 && productId === 'snacks') {
      nextStep = 2;
    }

    set({
      stats: updatedStats,
      products: updatedProducts,
      tutorialStep: nextStep,
    });

    return true;
  },

  unlockProduct: (productId: ProductId) => {
    const { stats, progression, products } = get();
    const prod = products.find((p) => p.id === productId);
    if (!prod || prod.isUnlocked) return false;

    if (progression.level < prod.unlockStoreLevel) return false;
    if (stats.cash < prod.unlockCost) return false;

    const updatedProducts = products.map((p) =>
      p.id === productId ? { ...p, isUnlocked: true, stock: Math.floor(p.maxCapacity / 2) } : p
    );

    soundManager.playUpgrade();
    confetti({ particleCount: 40 });

    set({
      stats: {
        ...stats,
        cash: stats.cash - prod.unlockCost,
      },
      products: updatedProducts,
    });

    return true;
  },

  hireStaff: (staffId: string) => {
    const { stats, staff } = get();
    const target = staff.find((s) => s.id === staffId);
    if (!target || target.hired) return false;
    if (stats.cash < target.hiringCost) return false;

    const updatedStaff = staff.map((s) =>
      s.id === staffId ? { ...s, hired: true, active: true } : s
    );

    soundManager.playUpgrade();
    confetti({ particleCount: 50 });

    set({
      stats: {
        ...stats,
        cash: stats.cash - target.hiringCost,
      },
      staff: updatedStaff,
    });

    return true;
  },

  upgradeStaff: (staffId: string) => {
    const { stats, staff } = get();
    const target = staff.find((s) => s.id === staffId);
    if (!target || !target.hired) return false;

    const cost = Math.round(target.upgradeCost * Math.pow(1.5, target.level - 1));
    if (stats.cash < cost) return false;

    const updatedStaff = staff.map((s) =>
      s.id === staffId
        ? {
            ...s,
            level: s.level + 1,
            workSpeed: s.workSpeed + 0.35,
          }
        : s
    );

    soundManager.playUpgrade();

    set({
      stats: {
        ...stats,
        cash: stats.cash - cost,
      },
      staff: updatedStaff,
    });

    return true;
  },

  buyUpgrade: (upgradeId: string) => {
    const { stats, upgrades, products } = get();
    const upg = upgrades.find((u) => u.id === upgradeId);
    if (!upg || upg.level >= upg.maxLevel) return false;

    const cost = calculateUpgradeCost(upg.baseCost, upg.costMultiplier, upg.level);
    if (stats.cash < cost) return false;

    let updatedProducts = products;
    if (upgradeId === 'shelf_capacity') {
      updatedProducts = products.map((p) => ({
        ...p,
        maxCapacity: p.maxCapacity + upg.effectValue,
      }));
    }

    const updatedUpgrades = upgrades.map((u) =>
      u.id === upgradeId ? { ...u, level: u.level + 1 } : u
    );

    soundManager.playUpgrade();

    set({
      stats: {
        ...stats,
        cash: stats.cash - cost,
        totalUpgrades: stats.totalUpgrades + cost,
      },
      upgrades: updatedUpgrades,
      products: updatedProducts,
    });

    return true;
  },

  manualRegisterClick: () => {
    const { customers, particles } = get();
    const payingCustomer = customers.find((c) => c.state === 'PAYING');
    if (!payingCustomer) return;

    soundManager.playClick();

    const updatedCustomers = customers.map((c) =>
      c.id === payingCustomer.id
        ? { ...c, payingProgress: Math.min(1.0, c.payingProgress + 0.35) }
        : c
    );

    set({
      customers: updatedCustomers,
      particles: [
        ...particles,
        {
          id: `boost-${Date.now()}`,
          x: payingCustomer.x,
          y: payingCustomer.y - 15,
          text: '⚡ SPEED BOOST!',
          color: '#fbbf24',
          opacity: 1.0,
          vy: -30,
          life: 0.8,
        },
      ],
    });
  },

  setActiveTab: (tab: ManagementTab) => {
    soundManager.playClick();
    set({ activeTab: tab });
  },

  setGameSpeed: (speed: number) => {
    const { progression } = get();
    soundManager.playClick();
    set({ progression: { ...progression, gameSpeed: speed, isPaused: false } });
  },

  togglePause: () => {
    const { progression } = get();
    soundManager.playClick();
    set({ progression: { ...progression, isPaused: !progression.isPaused } });
  },

  toggleMute: () => {
    const { isMuted } = get();
    const nextMuted = !isMuted;
    soundManager.setMuted(nextMuted);
    set({ isMuted: nextMuted });
  },

  toggleMusic: () => {
    const { isMusicPlaying } = get();
    const nextState = !isMusicPlaying;
    soundManager.toggleMusic(nextState);
    set({ isMusicPlaying: nextState });
  },

  dismissOfflineModal: () => {
    soundManager.playCashRegister();
    set({ offlineSummary: null });
  },

  advanceTutorial: () => {
    const { tutorialStep } = get();
    soundManager.playClick();
    const next = tutorialStep + 1;
    set({
      tutorialStep: next,
      hasCompletedTutorial: next >= 4,
    });
  },

  resetGame: () => {
    clearGameSave();
    soundManager.playClick();
    set({
      stats: { ...INITIAL_STATS },
      progression: { ...INITIAL_PROGRESSION },
      products: INITIAL_PRODUCTS.map((p) => ({ ...p })),
      staff: INITIAL_STAFF.map((s) => ({ ...s })),
      upgrades: INITIAL_UPGRADES.map((u) => ({ ...u })),
      achievements: INITIAL_ACHIEVEMENTS.map((a) => ({ ...a })),
      customers: [],
      particles: [],
      tutorialStep: 0,
      hasCompletedTutorial: false,
      offlineSummary: null,
    });
  },

  exportSaveData: () => {
    const { stats, progression, products, staff, upgrades, achievements, hasCompletedTutorial } =
      get();
    return exportSaveString({
      version: 1,
      timestamp: Date.now(),
      stats,
      progression,
      products,
      staff,
      upgrades,
      achievements,
      hasCompletedTutorial,
    });
  },

  importSaveData: (code: string) => {
    const imported = importSaveString(code);
    if (!imported) return false;
    soundManager.playUpgrade();
    set({
      stats: imported.stats,
      progression: imported.progression,
      products: imported.products,
      staff: imported.staff,
      upgrades: imported.upgrades,
      achievements: imported.achievements,
      hasCompletedTutorial: imported.hasCompletedTutorial,
      tutorialStep: imported.hasCompletedTutorial ? 4 : 0,
    });
    return true;
  },
}));
