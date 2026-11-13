import type {
  StoreProgression,
  FinancialStats,
  Achievement,
  StaffMember,
} from '../../types/game';

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  cashBonus: number;
}

export function checkLevelUp(
  progression: StoreProgression,
  stats: FinancialStats
): {
  updatedProgression: StoreProgression;
  updatedStats: FinancialStats;
  levelUpResult: LevelUpResult;
} {
  let { level, xp, xpToNextLevel } = progression;
  let cash = stats.cash;
  let leveledUp = false;
  let totalBonus = 0;

  while (xp >= xpToNextLevel) {
    xp -= xpToNextLevel;
    level += 1;
    xpToNextLevel = Math.round(xpToNextLevel * 1.6);
    const bonus = level * 100;
    cash += bonus;
    totalBonus += bonus;
    leveledUp = true;
  }

  return {
    updatedProgression: {
      ...progression,
      level,
      xp,
      xpToNextLevel,
    },
    updatedStats: {
      ...stats,
      cash,
    },
    levelUpResult: {
      leveledUp,
      newLevel: level,
      cashBonus: totalBonus,
    },
  };
}

export function evaluateAchievements(
  achievements: Achievement[],
  stats: FinancialStats,
  progression: StoreProgression,
  staff: StaffMember[]
): {
  updatedAchievements: Achievement[];
  newlyUnlocked: Achievement[];
  bonusCash: number;
  bonusXp: number;
} {
  const updatedAchievements: Achievement[] = [];
  const newlyUnlocked: Achievement[] = [];
  let bonusCash = 0;
  let bonusXp = 0;

  const totalItemsSold = Object.values(stats.itemsSold).reduce((a, b) => a + b, 0);
  const hiredStaffCount = staff.filter((s) => s.hired).length;

  for (const ach of achievements) {
    if (ach.isUnlocked) {
      updatedAchievements.push(ach);
      continue;
    }

    let currentProgress = ach.progress;
    let unlocked = false;

    switch (ach.id) {
      case 'first_sale':
        currentProgress = stats.customersServed >= 1 ? 1 : 0;
        unlocked = currentProgress >= ach.maxProgress;
        break;

      case 'first_hundred':
        currentProgress = Math.min(ach.maxProgress, stats.totalRevenue);
        unlocked = stats.totalRevenue >= 100;
        break;

      case 'hire_staff':
        currentProgress = Math.min(ach.maxProgress, hiredStaffCount);
        unlocked = hiredStaffCount >= 1;
        break;

      case 'restock_master':
        currentProgress = Math.min(ach.maxProgress, totalItemsSold);
        unlocked = totalItemsSold >= 30;
        break;

      case 'store_level_2':
        currentProgress = Math.min(ach.maxProgress, progression.level);
        unlocked = progression.level >= 2;
        break;

      case 'mogul':
        currentProgress = Math.min(ach.maxProgress, stats.cash);
        unlocked = stats.cash >= 1000;
        break;

      case 'full_automation':
        currentProgress = Math.min(ach.maxProgress, hiredStaffCount);
        unlocked = hiredStaffCount >= 3;
        break;
    }

    if (unlocked) {
      newlyUnlocked.push(ach);
      bonusCash += ach.rewardCash;
      bonusXp += ach.rewardXp;
      updatedAchievements.push({
        ...ach,
        isUnlocked: true,
        progress: ach.maxProgress,
      });
    } else {
      updatedAchievements.push({
        ...ach,
        progress: currentProgress,
      });
    }
  }

  return {
    updatedAchievements,
    newlyUnlocked,
    bonusCash,
    bonusXp,
  };
}
