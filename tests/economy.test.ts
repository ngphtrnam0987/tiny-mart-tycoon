import { describe, it, expect } from 'vitest';
import {
  canAfford,
  buyStock,
  calculateUpgradeCost,
  calculateEffectiveSalePrice,
  applySaleToStats,
} from '../src/game/economy/economySystem';
import { INITIAL_PRODUCTS, INITIAL_STATS } from '../src/data/initialData';
import type { Product, FinancialStats } from '../src/types/game';

describe('Economy System', () => {
  const baseSnack: Product = {
    ...INITIAL_PRODUCTS[0],
    stock: 5,
    maxCapacity: 20,
    costPrice: 3,
    salePrice: 6,
    isUnlocked: true,
  };

  it('verifies canAfford correctly', () => {
    expect(canAfford(200, 50)).toBe(true);
    expect(canAfford(50, 50)).toBe(true);
    expect(canAfford(49, 50)).toBe(false);
    expect(canAfford(0, 10)).toBe(false);
    expect(canAfford(NaN, 10)).toBe(false);
    expect(canAfford(100, -5)).toBe(false);
  });

  it('restocks successfully when funds and capacity are sufficient', () => {
    const result = buyStock(100, baseSnack, 10);
    expect(result.success).toBe(true);
    expect(result.totalCost).toBe(30); // 10 * $3
    expect(result.newCash).toBe(70);
    expect(result.newStock).toBe(15);
  });

  it('fails restock if player has insufficient funds', () => {
    const result = buyStock(10, baseSnack, 5); // 5 * 3 = $15 > $10
    expect(result.success).toBe(false);
    expect(result.reason).toBe('insufficient_funds');
    expect(result.newCash).toBe(10);
    expect(result.newStock).toBe(5);
  });

  it('fails restock if quantity exceeds shelf max capacity', () => {
    // Current stock: 5, max: 20. Remaining capacity = 15
    const result = buyStock(500, baseSnack, 16);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('exceeds_capacity');
    expect(result.newStock).toBe(5);
  });

  it('rejects invalid or non-positive stock amounts', () => {
    expect(buyStock(100, baseSnack, 0).success).toBe(false);
    expect(buyStock(100, baseSnack, -3).success).toBe(false);
    expect(buyStock(100, baseSnack, 2.5).success).toBe(false);
  });

  it('fails to restock locked products', () => {
    const lockedProd: Product = {
      ...baseSnack,
      isUnlocked: false,
    };
    const result = buyStock(100, lockedProd, 2);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('locked');
  });

  it('calculates upgrade cost scaling properly', () => {
    const baseCost = 100;
    const mult = 1.5;
    expect(calculateUpgradeCost(baseCost, mult, 0)).toBe(100);
    expect(calculateUpgradeCost(baseCost, mult, 1)).toBe(150);
    expect(calculateUpgradeCost(baseCost, mult, 2)).toBe(225);
  });

  it('calculates wholesale margin bonuses accurately', () => {
    expect(calculateEffectiveSalePrice(10, 0)).toBe(10);
    expect(calculateEffectiveSalePrice(10, 1)).toBe(11); // +10%
    expect(calculateEffectiveSalePrice(10, 2)).toBe(12); // +20%
  });

  it('records customer sale, updates revenue, cogs, and itemsSold without double-counting', () => {
    const stats: FinancialStats = { ...INITIAL_STATS, cash: 100 };
    const { newStats, revenue, cogs } = applySaleToStats(stats, baseSnack, 1, 0);

    expect(revenue).toBe(6);
    expect(cogs).toBe(3);
    expect(newStats.cash).toBe(106);
    expect(newStats.totalRevenue).toBe(6);
    expect(newStats.netProfit).toBe(3);
    expect(newStats.customersServed).toBe(1);
    expect(newStats.itemsSold.snacks).toBe(1);
  });
});
