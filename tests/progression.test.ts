import { describe, it, expect } from 'vitest';
import { checkLevelUp, evaluateAchievements } from '../src/game/progression/progressionSystem';
import { INITIAL_PROGRESSION, INITIAL_STATS, INITIAL_ACHIEVEMENTS, INITIAL_STAFF } from '../src/data/initialData';
import type { StoreProgression, FinancialStats, StaffMember } from '../src/types/game';

describe('Progression & Achievement System', () => {
  it('levels up store when XP exceeds threshold and awards bonus capital', () => {
    const progression: StoreProgression = {
      ...INITIAL_PROGRESSION,
      level: 1,
      xp: 120,
      xpToNextLevel: 100,
    };
    const stats: FinancialStats = {
      ...INITIAL_STATS,
      cash: 200,
    };

    const { updatedProgression, updatedStats, levelUpResult } = checkLevelUp(progression, stats);

    expect(levelUpResult.leveledUp).toBe(true);
    expect(updatedProgression.level).toBe(2);
    expect(updatedProgression.xp).toBe(20);
    expect(updatedStats.cash).toBeGreaterThan(200);
  });

  it('evaluates and unlocks achievements when milestones are achieved', () => {
    const stats: FinancialStats = {
      ...INITIAL_STATS,
      customersServed: 1,
      totalRevenue: 150,
    };
    const progression: StoreProgression = { ...INITIAL_PROGRESSION, level: 1 };
    const staff: StaffMember[] = [{ ...INITIAL_STAFF[0], hired: true }];

    const { updatedAchievements, newlyUnlocked, bonusCash } = evaluateAchievements(
      INITIAL_ACHIEVEMENTS,
      stats,
      progression,
      staff
    );

    // Should unlock first_sale, first_hundred, hire_staff
    const unlockedIds = newlyUnlocked.map((a) => a.id);
    expect(unlockedIds).toContain('first_sale');
    expect(unlockedIds).toContain('first_hundred');
    expect(unlockedIds).toContain('hire_staff');
    expect(bonusCash).toBeGreaterThan(0);

    const firstSaleAch = updatedAchievements.find((a) => a.id === 'first_sale');
    expect(firstSaleAch?.isUnlocked).toBe(true);
  });

  it('does not re-unlock or double-reward already unlocked achievements', () => {
    const achievements = INITIAL_ACHIEVEMENTS.map((a) =>
      a.id === 'first_sale' ? { ...a, isUnlocked: true, progress: 1 } : a
    );
    const stats: FinancialStats = { ...INITIAL_STATS, customersServed: 5 };

    const { newlyUnlocked, bonusCash } = evaluateAchievements(
      achievements,
      stats,
      INITIAL_PROGRESSION,
      INITIAL_STAFF
    );

    expect(newlyUnlocked.find((a) => a.id === 'first_sale')).toBeUndefined();
    expect(bonusCash).toBe(0);
  });
});
