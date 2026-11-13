import { describe, it, expect } from 'vitest';
import { spawnCustomer, updateCustomers } from '../src/game/systems/customerSystem';
import { INITIAL_PRODUCTS } from '../src/data/initialData';
import type { Customer, Product } from '../src/types/game';

describe('Customer AI State Machine', () => {
  const testProducts: Product[] = INITIAL_PRODUCTS.map((p) => ({
    ...p,
    stock: 10,
    isUnlocked: true,
  }));

  it('spawns a customer with valid initial state and appearance', () => {
    const customer = spawnCustomer(testProducts);
    expect(customer).not.toBeNull();
    if (!customer) return;

    expect(customer.state).toBe('ENTERING');
    expect(customer.hasItem).toBe(false);
    expect(customer.shoppingProgress).toBe(0);
    expect(customer.payingProgress).toBe(0);
    expect(customer.desiredProduct).toBeDefined();
    expect(customer.appearance.shirtColor).toBeDefined();
  });

  it('moves from ENTERING to SHOPPING when reaching shelf', () => {
    const customer = spawnCustomer(testProducts)!;
    // Set customer position right at target
    customer.x = customer.targetX;
    customer.y = customer.targetY;

    const { updatedCustomers } = updateCustomers([customer], testProducts, 0.1, 0, 0);
    expect(updatedCustomers[0].state).toBe('SHOPPING');
  });

  it('progresses shopping, decrements shelf stock safely and transitions to QUEUING', () => {
    const prods = testProducts.map((p) => ({ ...p, stock: 5 }));
    const customer: Customer = {
      ...spawnCustomer(testProducts)!,
      state: 'SHOPPING',
      desiredProduct: 'snacks',
      shoppingProgress: 0.95,
      hasItem: false,
    };

    // Enough delta time to finish shopping
    const { updatedCustomers } = updateCustomers([customer], prods, 0.5, 0, 0);
    const updatedCustomer = updatedCustomers[0];

    expect(updatedCustomer.hasItem).toBe(true);
    expect(updatedCustomer.state).toBe('QUEUING');
    // Product stock should have decremented by 1
    const snackProd = prods.find((p) => p.id === 'snacks');
    expect(snackProd?.stock).toBe(4);
  });

  it('handles out-of-stock items: customer walks away frustrated', () => {
    const emptyProds = testProducts.map((p) => ({ ...p, stock: 0 }));
    const customer: Customer = {
      ...spawnCustomer(testProducts)!,
      state: 'SHOPPING',
      desiredProduct: 'snacks',
      shoppingProgress: 0,
      hasItem: false,
    };

    const { updatedCustomers, result } = updateCustomers([customer], emptyProds, 0.1, 0, 0);
    expect(updatedCustomers[0].state).toBe('LEAVING');
    expect(updatedCustomers[0].frustrated).toBe(true);
    expect(result.walkedAway).toBe(1);
  });

  it('processes payment at checkout counter and emits completed sale', () => {
    const customer: Customer = {
      ...spawnCustomer(testProducts)!,
      state: 'PAYING',
      desiredProduct: 'drinks',
      payingProgress: 0.9,
      hasItem: true,
    };

    const { updatedCustomers, result } = updateCustomers([customer], testProducts, 0.5, 1.0, 0);
    expect(result.completedSales.length).toBe(1);
    expect(result.completedSales[0].productId).toBe('drinks');
    expect(updatedCustomers[0].state).toBe('LEAVING');
    expect(result.particles.length).toBe(1);
  });
});
