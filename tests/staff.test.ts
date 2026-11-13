import { describe, it, expect } from 'vitest';
import {
  calculateStaffSalaries,
  performStockerAutomation,
  getCashierSpeedMultiplier,
} from '../src/game/systems/staffSystem';
import { INITIAL_STAFF, INITIAL_PRODUCTS } from '../src/data/initialData';
import type { StaffMember, Product } from '../src/types/game';

describe('Staff Automation System', () => {
  it('calculates staff salaries correctly based on level and time', () => {
    const hiredStaff: StaffMember[] = [
      { ...INITIAL_STAFF[0], hired: true, active: true, baseSalaryPerMin: 10, level: 1 },
      { ...INITIAL_STAFF[1], hired: true, active: true, baseSalaryPerMin: 12, level: 2 }, // 12 * 1.25 = 15
    ];

    // Total per minute = 10 + 15 = 25
    expect(calculateStaffSalaries(hiredStaff, 1.0)).toBe(25);
    expect(calculateStaffSalaries(hiredStaff, 2.0)).toBe(50);
  });

  it('unhired or inactive staff do not incur salary', () => {
    const staffList: StaffMember[] = [
      { ...INITIAL_STAFF[0], hired: false, active: true, baseSalaryPerMin: 10 },
      { ...INITIAL_STAFF[1], hired: true, active: false, baseSalaryPerMin: 15 },
    ];
    expect(calculateStaffSalaries(staffList, 1.0)).toBe(0);
  });

  it('increases cashier speed multiplier with cashier level and manager bonus', () => {
    const cashier: StaffMember = {
      ...INITIAL_STAFF[0],
      hired: true,
      active: true,
      level: 2,
    };

    // base 0.8 + 2 * 0.4 = 1.6
    expect(getCashierSpeedMultiplier(cashier, false, 0)).toBeCloseTo(1.6);
    // with manager (+0.3)
    expect(getCashierSpeedMultiplier(cashier, true, 0)).toBeCloseTo(1.9);
  });

  it('stocker automatically restocks low shelves when store has cash', () => {
    const stocker: StaffMember = {
      ...INITIAL_STAFF[1],
      hired: true,
      active: true,
      level: 1,
    };

    // Product at low stock (2 / 20 = 10% < 40%)
    const products: Product[] = [
      { ...INITIAL_PRODUCTS[0], id: 'snacks', stock: 2, maxCapacity: 20, costPrice: 3, isUnlocked: true },
    ];

    const initialCash = 100;
    const result = performStockerAutomation(stocker, products, initialCash, 0, false);

    expect(result.restocked.length).toBe(1);
    expect(result.restocked[0].productId).toBe('snacks');
    expect(result.cogsSpent).toBeGreaterThan(0);
    expect(result.newCash).toBe(initialCash - result.cogsSpent);
    expect(result.updatedProducts[0].stock).toBeGreaterThan(2);
  });

  it('stocker does nothing if store does not have enough cash', () => {
    const stocker: StaffMember = {
      ...INITIAL_STAFF[1],
      hired: true,
      active: true,
    };

    const products: Product[] = [
      { ...INITIAL_PRODUCTS[0], id: 'snacks', stock: 1, maxCapacity: 20, costPrice: 10, isUnlocked: true },
    ];

    // Cash is 0, cannot buy
    const result = performStockerAutomation(stocker, products, 0, 0, false);
    expect(result.restocked.length).toBe(0);
    expect(result.newCash).toBe(0);
    expect(result.updatedProducts[0].stock).toBe(1);
  });
});
