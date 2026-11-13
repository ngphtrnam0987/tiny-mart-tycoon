import type { Product, FinancialStats } from '../../types/game';

export interface BuyStockResult {
  success: boolean;
  reason?: 'insufficient_funds' | 'exceeds_capacity' | 'invalid_amount' | 'locked';
  totalCost: number;
  newCash: number;
  newStock: number;
}

export function canAfford(cash: number, amount: number): boolean {
  if (typeof cash !== 'number' || typeof amount !== 'number' || isNaN(cash) || isNaN(amount)) {
    return false;
  }
  return cash >= amount && amount >= 0;
}

export function buyStock(
  cash: number,
  product: Product,
  amount: number
): BuyStockResult {
  if (amount <= 0 || !Number.isInteger(amount)) {
    return {
      success: false,
      reason: 'invalid_amount',
      totalCost: 0,
      newCash: cash,
      newStock: product.stock,
    };
  }

  if (!product.isUnlocked) {
    return {
      success: false,
      reason: 'locked',
      totalCost: 0,
      newCash: cash,
      newStock: product.stock,
    };
  }

  const spaceAvailable = product.maxCapacity - product.stock;
  if (spaceAvailable <= 0 || amount > spaceAvailable) {
    return {
      success: false,
      reason: 'exceeds_capacity',
      totalCost: 0,
      newCash: cash,
      newStock: product.stock,
    };
  }

  const totalCost = product.costPrice * amount;
  if (!canAfford(cash, totalCost)) {
    return {
      success: false,
      reason: 'insufficient_funds',
      totalCost,
      newCash: cash,
      newStock: product.stock,
    };
  }

  return {
    success: true,
    totalCost,
    newCash: cash - totalCost,
    newStock: product.stock + amount,
  };
}

export function calculateUpgradeCost(
  baseCost: number,
  costMultiplier: number,
  currentLevel: number
): number {
  if (currentLevel <= 0) return baseCost;
  return Math.round(baseCost * Math.pow(costMultiplier, currentLevel));
}

export function calculateEffectiveSalePrice(
  baseSalePrice: number,
  wholesaleUpgradeLevel: number
): number {
  const marginBonus = 1 + wholesaleUpgradeLevel * 0.1;
  return Math.round(baseSalePrice * marginBonus);
}

export function applySaleToStats(
  stats: FinancialStats,
  product: Product,
  quantity: number = 1,
  wholesaleUpgradeLevel: number = 0
): {
  newStats: FinancialStats;
  revenue: number;
  cogs: number;
} {
  const effectiveSalePrice = calculateEffectiveSalePrice(product.salePrice, wholesaleUpgradeLevel);
  const revenue = effectiveSalePrice * quantity;
  const cogs = product.costPrice * quantity;

  const newStats: FinancialStats = {
    ...stats,
    cash: stats.cash + revenue,
    totalRevenue: stats.totalRevenue + revenue,
    netProfit: stats.netProfit + (revenue - cogs),
    customersServed: stats.customersServed + 1,
    itemsSold: {
      ...stats.itemsSold,
      [product.id]: (stats.itemsSold[product.id] || 0) + quantity,
    },
  };

  return { newStats, revenue, cogs };
}
