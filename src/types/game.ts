export type ProductId = 'snacks' | 'drinks' | 'essentials' | 'produce' | 'bakery' | 'electronics';

export interface Product {
  id: ProductId;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  maxCapacity: number;
  serviceDuration: number;
  isUnlocked: boolean;
  unlockCost: number;
  unlockStoreLevel: number;
  color: string;
  iconName: string;
}

export type StaffType = 'cashier' | 'stocker' | 'manager';

export interface StaffMember {
  id: string;
  type: StaffType;
  name: string;
  title: string;
  level: number;
  hired: boolean;
  hiringCost: number;
  baseSalaryPerMin: number;
  upgradeCost: number;
  workSpeed: number;
  active: boolean;
  avatarColor: string;
}

export type UpgradeCategory = 'store' | 'staff' | 'marketing' | 'supply';

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effectValue: number;
  reqStoreLevel: number;
}

export type CustomerType = 'regular' | 'vip' | 'express';
export type CustomerState = 'ENTERING' | 'SHOPPING' | 'QUEUING' | 'PAYING' | 'LEAVING';

export interface CustomerAppearance {
  bodyColor: string;
  shirtColor: string;
  hairColor: string;
  headwear?: 'cap' | 'glasses' | 'bow' | 'crown' | 'none';
}

export interface SpeechBubble {
  text: string;
  icon?: string;
  type: 'need' | 'happy' | 'angry' | 'money' | 'vip';
  timer: number;
}

export interface Customer {
  id: string;
  name: string;
  customerType: CustomerType;
  isVip: boolean;
  tipBonus: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: CustomerState;
  desiredProduct: ProductId;
  hasItem: boolean;
  shoppingProgress: number;
  payingProgress: number;
  speed: number;
  appearance: CustomerAppearance;
  speechBubble?: SpeechBubble;
  walkFrame: number;
  frustrated: boolean;
}

export interface CheckoutCounter {
  id: string;
  x: number;
  y: number;
  queuePositions: Array<{ x: number; y: number }>;
}

export interface ShelfLocation {
  id: string;
  productId: ProductId;
  x: number;
  y: number;
  width: number;
  height: number;
  interactionX: number;
  interactionY: number;
}

export interface FinancialStats {
  cash: number;
  totalRevenue: number;
  totalCogs: number;
  totalSalaries: number;
  totalUpgrades: number;
  netProfit: number;
  customersServed: number;
  customersWalkedAway: number;
  itemsSold: Record<ProductId, number>;
  vipCustomersServed?: number;
  totalTipsEarned?: number;
}

export interface StoreProgression {
  storeName: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  day: number;
  timeOfDay: number; // 8.0 to 22.0 in-game hours
  isPaused: boolean;
  gameSpeed: number;
  prestigeStars?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardCash: number;
  rewardXp: number;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface FloatingParticle {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  vy: number;
  life: number;
}

export interface OfflineSummary {
  offlineSeconds: number;
  unitsSold: number;
  grossRevenue: number;
  cogs: number;
  salaries: number;
  netProfit: number;
}

export interface StoreDecoration {
  id: string;
  name: string;
  description: string;
  cost: number;
  isPurchased: boolean;
  passiveBonus: string;
  reqLevel: number;
  icon: string;
  x: number;
  y: number;
}

export interface DailyMarketDeal {
  discountedProductId: ProductId; // -40% wholesale cost
  trendingProductId: ProductId;   // +50% retail price
  expiresInSeconds: number;
}

export interface GameSaveSchemaV1 {
  version: 1;
  timestamp: number;
  stats: FinancialStats;
  progression: StoreProgression;
  products: Product[];
  staff: StaffMember[];
  upgrades: Upgrade[];
  achievements: Achievement[];
  decorations?: StoreDecoration[];
  hasCompletedTutorial: boolean;
}
