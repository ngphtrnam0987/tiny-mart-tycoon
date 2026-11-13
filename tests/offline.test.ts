import { describe, it, expect } from 'vitest';
import {
  calculateOfflineProgress,
  MAX_OFFLINE_SECONDS,
} from '../src/game/economy/offlineEarnings';
import {
  INITIAL_STATS,
  INITIAL_PRODUCTS,
  INITIAL_STAFF,
  INITIAL_UPGRADES,
} from '../src/data/initialData';
import type { FinancialStats, Product, StaffMember } from '../src/types/game';

describe('Offline Progression System', () => {
  const products: Product[] = INITIAL_PRODUCTS.map((p) => ({
    ...p,
    stock: 15,
    isUnlocked: true,
  }));

  const staff: StaffMember[] = [
    { ...INITIAL_STAFF[0], hired: true, active: true },
    { ...INITIAL_STAFF[1], hired: true, active: true },
  ];

  it('ignores offline durations less than MIN_OFFLINE_SECONDS (30s)', () => {
    const now = Date.now();
    const result = calculateOfflineProgress(
      now - 15 * 1000,
      now,
      INITIAL_STATS,
      products,
      staff,
      INITIAL_UPGRADES
    );
    expect(result.summary).toBeNull();
  });

  it('caps offline progression at 4 hours maximum (14,400s)', () => {
    const now = Date.now();
    const tenHoursAgo = now - 10 * 3600 * 1000;

    const result = calculateOfflineProgress(
      tenHoursAgo,
      now,
      INITIAL_STATS,
      products,
      staff,
      INITIAL_UPGRADES
    );

    expect(result.summary).not.toBeNull();
    expect(result.summary?.offlineSeconds).toBe(MAX_OFFLINE_SECONDS);
  });

  it('safely handles corrupted, NaN, or future timestamps without crashing', () => {
    const now = Date.now();
    expect(
      calculateOfflineProgress(NaN, now, INITIAL_STATS, products, staff, INITIAL_UPGRADES).summary
    ).toBeNull();
    expect(
      calculateOfflineProgress(now + 10000, now, INITIAL_STATS, products, staff, INITIAL_UPGRADES).summary
    ).toBeNull();
    expect(
      calculateOfflineProgress(0, now, INITIAL_STATS, products, staff, INITIAL_UPGRADES).summary
    ).toBeNull();
  });

  it('calculates sound financial breakdown: distinguishes revenue, cogs, salaries, and net profit', () => {
    const now = Date.now();
    const oneHourAgo = now - 3600 * 1000;
    const stats: FinancialStats = { ...INITIAL_STATS, cash: 500 };

    const result = calculateOfflineProgress(
      oneHourAgo,
      now,
      stats,
      products,
      staff,
      INITIAL_UPGRADES
    );

    const summary = result.summary;
    expect(summary).not.toBeNull();
    if (!summary) return;

    expect(summary.grossRevenue).toBeGreaterThanOrEqual(0);
    expect(summary.cogs).toBeGreaterThanOrEqual(0);
    expect(summary.salaries).toBeGreaterThanOrEqual(0);
    expect(summary.netProfit).toBe(summary.grossRevenue - summary.cogs - summary.salaries);

    // Final cash must not be negative or NaN
    expect(result.updatedStats.cash).toBeGreaterThanOrEqual(0);
    expect(isNaN(result.updatedStats.cash)).toBe(false);
  });
});
