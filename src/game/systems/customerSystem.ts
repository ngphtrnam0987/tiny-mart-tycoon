import type {
  Customer,
  ProductId,
  Product,
  CustomerAppearance,
  CustomerType,
  FloatingParticle,
} from '../../types/game';
import {
  STORE_ENTRANCE,
  STORE_EXIT,
  CHECKOUT_COUNTER,
  SHELF_LOCATIONS,
} from '../../data/initialData';

const BODY_COLORS = ['#fed7aa', '#fde68a', '#fbcfe8', '#e9d5ff', '#c7d2fe', '#bae6fd'];
const SHIRT_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'];
const HAIR_COLORS = ['#78350f', '#1f2937', '#92400e', '#d97706', '#4b5563', '#fef08a'];

let customerCounter = 1;

export function generateRandomAppearance(isVip: boolean = false): CustomerAppearance {
  const bodyColor = BODY_COLORS[Math.floor(Math.random() * BODY_COLORS.length)];
  const shirtColor = isVip ? '#fbbf24' : SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];
  const hairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
  const headwearOptions: Array<'cap' | 'glasses' | 'bow' | 'crown' | 'none'> = isVip
    ? ['crown', 'crown', 'glasses']
    : ['cap', 'glasses', 'bow', 'none', 'none'];
  const headwear = headwearOptions[Math.floor(Math.random() * headwearOptions.length)];

  return { bodyColor, shirtColor, hairColor, headwear };
}

export function spawnCustomer(
  unlockedProducts: Product[],
  vipBonusChance: number = 0
): Customer | null {
  if (unlockedProducts.length === 0) return null;

  const randomProduct = unlockedProducts[Math.floor(Math.random() * unlockedProducts.length)];
  const shelf = SHELF_LOCATIONS[randomProduct.id];
  const targetX = shelf ? shelf.interactionX : 400;
  const targetY = shelf ? shelf.interactionY : 250;

  const id = `cust-${customerCounter++}`;
  const names = ['Lily', 'Oliver', 'Emma', 'Noah', 'Mila', 'Leo', 'Ava', 'Lucas', 'Mia', 'Ethan', 'Chloe', 'Liam', 'Sophia', 'James'];
  const name = names[Math.floor(Math.random() * names.length)];

  const isVipRoll = Math.random() < 0.12 + vipBonusChance;
  const isExpressRoll = !isVipRoll && Math.random() < 0.25;

  let customerType: CustomerType = 'regular';
  let speed = 1.6 + Math.random() * 0.4;
  let tipBonus = 0;

  if (isVipRoll) {
    customerType = 'vip';
    speed = 1.8;
    tipBonus = Math.round(randomProduct.salePrice * 1.5); // VIP tips generous 150% extra!
  } else if (isExpressRoll) {
    customerType = 'express';
    speed = 2.4;
  }

  return {
    id,
    name,
    customerType,
    isVip: isVipRoll,
    tipBonus,
    x: STORE_ENTRANCE.x + (Math.random() * 20 - 10),
    y: STORE_ENTRANCE.y,
    targetX,
    targetY,
    state: 'ENTERING',
    desiredProduct: randomProduct.id,
    hasItem: false,
    shoppingProgress: 0,
    payingProgress: 0,
    speed,
    appearance: generateRandomAppearance(isVipRoll),
    walkFrame: 0,
    frustrated: false,
    speechBubble: {
      text: isVipRoll ? `⭐ ${randomProduct.name.split(' ')[0]}` : randomProduct.name.split(' ')[0],
      icon: randomProduct.iconName,
      type: isVipRoll ? 'vip' : 'need',
      timer: 3.0,
    },
  };
}

export interface CustomerUpdateResult {
  completedSales: Array<{ customerId: string; productId: ProductId; isVip: boolean; tipBonus: number }>;
  walkedAway: number;
  particles: FloatingParticle[];
}

export function updateCustomers(
  customers: Customer[],
  products: Product[],
  deltaSeconds: number,
  cashierEfficiencyMultiplier: number,
  laserScannerBonus: number,
  hasMonsteraPlant: boolean = false,
  hasLamps: boolean = false
): {
  updatedCustomers: Customer[];
  result: CustomerUpdateResult;
} {
  const result: CustomerUpdateResult = {
    completedSales: [],
    walkedAway: 0,
    particles: [],
  };

  const productMap = new Map<ProductId, Product>();
  products.forEach((p) => productMap.set(p.id, p));

  const queuingCustomers = customers.filter(
    (c) => c.state === 'QUEUING' || c.state === 'PAYING'
  );

  const updatedCustomers: Customer[] = [];

  for (const customer of customers) {
    const cust = { ...customer };

    if (cust.speechBubble) {
      cust.speechBubble = {
        ...cust.speechBubble,
        timer: cust.speechBubble.timer - deltaSeconds,
      };
      if (cust.speechBubble.timer <= 0) {
        cust.speechBubble = undefined;
      }
    }

    switch (cust.state) {
      case 'ENTERING': {
        const shelf = SHELF_LOCATIONS[cust.desiredProduct];
        const destX = shelf ? shelf.interactionX : 400;
        const destY = shelf ? shelf.interactionY : 200;
        cust.targetX = destX;
        cust.targetY = destY;

        moveTowardsTarget(cust, deltaSeconds);

        if (getDistance(cust.x, cust.y, destX, destY) < 10) {
          cust.state = 'SHOPPING';
          cust.shoppingProgress = 0;
        }
        break;
      }

      case 'SHOPPING': {
        const prod = productMap.get(cust.desiredProduct);
        if (!prod || prod.stock <= 0) {
          cust.frustrated = true;
          cust.state = 'LEAVING';
          cust.targetX = STORE_EXIT.x;
          cust.targetY = STORE_EXIT.y;
          cust.speechBubble = {
            text: cust.isVip ? 'VIP Out of Stock! 😡' : 'Sold out! :(',
            type: 'angry',
            timer: 2.0,
          };
          result.walkedAway += 1;
        } else {
          // Speed boosted if warm ceiling lamps are installed
          const lampSpeedBonus = hasLamps ? 1.2 : 1.0;
          const patienceMultiplier = hasMonsteraPlant ? 1.25 : 1.0;
          const duration = Math.max(0.5, ((prod.serviceDuration || 1200) / 1000) / (lampSpeedBonus * patienceMultiplier));
          cust.shoppingProgress += deltaSeconds / duration;

          if (cust.shoppingProgress >= 1.0) {
            if (prod.stock > 0) {
              prod.stock -= 1;
              cust.hasItem = true;
              cust.state = 'QUEUING';
              cust.speechBubble = {
                text: cust.isVip ? 'Got VIP Treat! ✨' : 'Got it! :)',
                type: cust.isVip ? 'vip' : 'happy',
                timer: 1.5,
              };
            } else {
              cust.frustrated = true;
              cust.state = 'LEAVING';
              cust.targetX = STORE_EXIT.x;
              cust.targetY = STORE_EXIT.y;
              result.walkedAway += 1;
            }
          }
        }
        break;
      }

      case 'QUEUING': {
        const qIndex = queuingCustomers.findIndex((c) => c.id === cust.id);
        const slotIndex = Math.min(qIndex >= 0 ? qIndex : 3, CHECKOUT_COUNTER.queuePositions.length - 1);
        const slotPos = CHECKOUT_COUNTER.queuePositions[slotIndex] || CHECKOUT_COUNTER.queuePositions[0];

        cust.targetX = slotPos.x;
        cust.targetY = slotPos.y;
        moveTowardsTarget(cust, deltaSeconds);

        if (slotIndex === 0 && getDistance(cust.x, cust.y, slotPos.x, slotPos.y) < 12) {
          cust.state = 'PAYING';
          cust.payingProgress = 0;
        }
        break;
      }

      case 'PAYING': {
        const checkoutSpeedMultiplier = 1.0 + laserScannerBonus + cashierEfficiencyMultiplier;
        const baseDuration = cust.isVip ? 1.4 : 1.2;
        cust.payingProgress += (deltaSeconds * checkoutSpeedMultiplier) / baseDuration;

        if (cust.payingProgress >= 1.0) {
          result.completedSales.push({
            customerId: cust.id,
            productId: cust.desiredProduct,
            isVip: cust.isVip,
            tipBonus: cust.tipBonus,
          });

          cust.state = 'LEAVING';
          cust.targetX = STORE_EXIT.x;
          cust.targetY = STORE_EXIT.y;
          cust.speechBubble = {
            text: cust.isVip ? `⭐ +$${cust.tipBonus} TIP!` : 'Thank you!',
            type: cust.isVip ? 'vip' : 'happy',
            timer: 2.2,
          };

          const prod = productMap.get(cust.desiredProduct);
          const saleVal = prod ? prod.salePrice : 6;
          const totalEarned = saleVal + cust.tipBonus;

          result.particles.push({
            id: `p-${Date.now()}-${Math.random()}`,
            x: cust.x,
            y: cust.y - 20,
            text: cust.isVip ? `👑 +$${totalEarned} (VIP)` : `+$${saleVal}`,
            color: cust.isVip ? '#fbbf24' : '#10b981',
            opacity: 1.0,
            vy: -35,
            life: 1.4,
          });
        }
        break;
      }

      case 'LEAVING': {
        cust.targetX = STORE_EXIT.x;
        cust.targetY = STORE_EXIT.y;
        moveTowardsTarget(cust, deltaSeconds);

        if (getDistance(cust.x, cust.y, STORE_EXIT.x, STORE_EXIT.y) < 15) {
          continue;
        }
        break;
      }
    }

    updatedCustomers.push(cust);
  }

  return { updatedCustomers, result };
}

function moveTowardsTarget(customer: Customer, deltaSeconds: number) {
  const dx = customer.targetX - customer.x;
  const dy = customer.targetY - customer.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 1) {
    const step = Math.min(dist, customer.speed * 60 * deltaSeconds);
    customer.x += (dx / dist) * step;
    customer.y += (dy / dist) * step;
    customer.walkFrame += deltaSeconds * 8;
  }
}

function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
