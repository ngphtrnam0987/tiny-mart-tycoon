import type {
  Product,
  StaffMember,
  Upgrade,
  OfflineSummary,
  FinancialStats,
} from '../../types/game';

export const MAX_OFFLINE_SECONDS = 4 * 60 * 60; // 4 hours cap = 14,400s
export const MIN_OFFLINE_SECONDS = 30; // Min 30s to trigger offline modal

export function calculateOfflineProgress(
  lastSaveTimestamp: number,
  currentTimestamp: number,
  stats: FinancialStats,
  products: Product[],
  staff: StaffMember[],
  upgrades: Upgrade[]
): {
  summary: OfflineSummary | null;
  updatedStats: FinancialStats;
  updatedProducts: Product[];
} {
  if (
    !lastSaveTimestamp ||
    !currentTimestamp ||
    isNaN(lastSaveTimestamp) ||
    isNaN(currentTimestamp) ||
    currentTimestamp <= lastSaveTimestamp
  ) {
    return { summary: null, updatedStats: { ...stats }, updatedProducts: products };
  }

  const rawElapsed = (currentTimestamp - lastSaveTimestamp) / 1000;
  if (rawElapsed < MIN_OFFLINE_SECONDS) {
    return { summary: null, updatedStats: { ...stats }, updatedProducts: products };
  }

  const offlineSeconds = Math.min(rawElapsed, MAX_OFFLINE_SECONDS);

  const cashier = staff.find((s) => s.type === 'cashier' && s.hired && s.active);
  const stocker = staff.find((s) => s.type === 'stocker' && s.hired && s.active);
  const manager = staff.find((s) => s.type === 'manager' && s.hired && s.active);

  const attractionUpgrade = upgrades.find((u) => u.id === 'customer_attraction');
  const attractionBonus = attractionUpgrade ? attractionUpgrade.level * attractionUpgrade.effectValue : 0;
  const profitUpgrade = upgrades.find((u) => u.id === 'profit_optimization');
  const profitBonusMultiplier = profitUpgrade ? 1 + profitUpgrade.level * profitUpgrade.effectValue : 1.0;

  const customersPerMinute = 6 * (1 + attractionBonus) * (manager ? 1.2 : 1.0);
  const totalPotentialCustomers = Math.floor((offlineSeconds / 60) * customersPerMinute);

  let totalSalaries = 0;
  const offlineMinutes = offlineSeconds / 60;
  staff.forEach((s) => {
    if (s.hired && s.active) {
      const salaryRate = s.baseSalaryPerMin * (1 + (s.level - 1) * 0.3);
      totalSalaries += salaryRate * offlineMinutes;
    }
  });

  const serviceEfficiency = cashier ? Math.min(1.0, 0.5 + cashier.level * 0.15) : 0.15;
  const actualCustomersServed = Math.floor(totalPotentialCustomers * serviceEfficiency);

  const unlockedProducts = products.filter((p) => p.isUnlocked);
  if (unlockedProducts.length === 0) {
    return { summary: null, updatedStats: { ...stats }, updatedProducts: products };
  }

  let grossRevenue = 0;
  let totalCogs = 0;
  let unitsSold = 0;
  const updatedProducts = products.map((p) => ({ ...p }));
  let currentCash = stats.cash;

  for (let i = 0; i < actualCustomersServed; i++) {
    const prodIndex = Math.floor(Math.random() * unlockedProducts.length);
    const prodTarget = unlockedProducts[prodIndex];
    const workingProd = updatedProducts.find((p) => p.id === prodTarget.id);

    if (!workingProd) continue;

    if (workingProd.stock > 0) {
      workingProd.stock -= 1;
      const effectiveSalePrice = Math.round(workingProd.salePrice * profitBonusMultiplier);
      grossRevenue += effectiveSalePrice;
      totalCogs += workingProd.costPrice;
      unitsSold += 1;
    } else if (stocker && currentCash >= workingProd.costPrice * 3) {
      const restockQty = Math.min(workingProd.maxCapacity, 3);
      const restockCost = restockQty * workingProd.costPrice;
      if (currentCash >= restockCost) {
        currentCash -= restockCost;
        workingProd.stock = restockQty - 1;
        const effectiveSalePrice = Math.round(workingProd.salePrice * profitBonusMultiplier);
        grossRevenue += effectiveSalePrice;
        totalCogs += workingProd.costPrice;
        unitsSold += 1;
      }
    }
  }

  const affordableSalaries = Math.min(totalSalaries, Math.max(0, currentCash + grossRevenue));
  const finalNetProfit = grossRevenue - totalCogs - affordableSalaries;
  const finalCash = Math.max(0, stats.cash + finalNetProfit);

  const updatedStats: FinancialStats = {
    ...stats,
    cash: Math.round(finalCash),
    totalRevenue: Math.round(stats.totalRevenue + grossRevenue),
    totalCogs: Math.round(stats.totalCogs + totalCogs),
    totalSalaries: Math.round(stats.totalSalaries + affordableSalaries),
    netProfit: Math.round(stats.netProfit + finalNetProfit),
    customersServed: stats.customersServed + actualCustomersServed,
  };

  const summary: OfflineSummary = {
    offlineSeconds: Math.floor(offlineSeconds),
    unitsSold,
    grossRevenue: Math.round(grossRevenue),
    cogs: Math.round(totalCogs),
    salaries: Math.round(affordableSalaries),
    netProfit: Math.round(finalNetProfit),
  };

  return { summary, updatedStats, updatedProducts };
}
