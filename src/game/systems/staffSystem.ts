import type { StaffMember, Product, FloatingParticle } from '../../types/game';
import { buyStock } from '../economy/economySystem';

export interface StockerState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isRestocking: boolean;
  carryingProduct?: string;
  cooldown: number;
}

export function calculateStaffSalaries(
  staff: StaffMember[],
  elapsedMinutes: number
): number {
  let total = 0;
  for (const member of staff) {
    if (member.hired && member.active) {
      const currentSalaryRate = member.baseSalaryPerMin * (1 + (member.level - 1) * 0.25);
      total += currentSalaryRate * elapsedMinutes;
    }
  }
  return Math.round(total);
}

export function performStockerAutomation(
  stocker: StaffMember,
  products: Product[],
  currentCash: number,
  stockerSpeedUpgradeLevel: number,
  managerHired: boolean
): {
  newCash: number;
  updatedProducts: Product[];
  cogsSpent: number;
  restocked: Array<{ productId: string; quantity: number }>;
  particles: FloatingParticle[];
} {
  const updatedProducts = products.map((p) => ({ ...p }));
  let cash = currentCash;
  let cogsSpent = 0;
  const restocked: Array<{ productId: string; quantity: number }> = [];

  if (!stocker.hired || !stocker.active) {
    return { newCash: cash, updatedProducts, cogsSpent, restocked, particles: [] };
  }

  const batchBonus = Math.floor(stockerSpeedUpgradeLevel * 1.5) + (managerHired ? 1 : 0);
  const restockBatch = 3 + (stocker.level - 1) * 2 + batchBonus;

  const candidates = updatedProducts
    .filter((p) => p.isUnlocked && p.stock < p.maxCapacity * 0.4)
    .sort((a, b) => a.stock / a.maxCapacity - b.stock / b.maxCapacity);

  if (candidates.length > 0) {
    const targetProduct = candidates[0];
    const needed = targetProduct.maxCapacity - targetProduct.stock;
    const amountToBuy = Math.min(needed, restockBatch);

    if (amountToBuy > 0) {
      const result = buyStock(cash, targetProduct, amountToBuy);
      if (result.success) {
        cash = result.newCash;
        targetProduct.stock = result.newStock;
        cogsSpent += result.totalCost;
        restocked.push({ productId: targetProduct.id, quantity: amountToBuy });
      }
    }
  }

  return { newCash: cash, updatedProducts, cogsSpent, restocked, particles: [] };
}

export function getCashierSpeedMultiplier(
  cashier: StaffMember | undefined,
  managerHired: boolean,
  staffLoungeUpgradeLevel: number
): number {
  if (!cashier || !cashier.hired || !cashier.active) {
    return 0;
  }

  const baseCashierSpeed = 0.8 + cashier.level * 0.4;
  const managerBonus = managerHired ? 0.3 : 0;
  const loungeBonus = staffLoungeUpgradeLevel * 0.15;

  return baseCashierSpeed + managerBonus + loungeBonus;
}
