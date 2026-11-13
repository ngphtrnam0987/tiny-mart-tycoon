export type ProductId = 'snacks' | 'drinks' | 'essentials' | 'produce' | 'bakery' | 'electronics';

export interface Product {
  id: ProductId;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  maxCapacity: number;
  serviceDuration: number; // ms to pick item
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
  workSpeed: number; // multiplier or speed factor
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
  effectValue: number; // per level effect (e.g. +10% or +10 capacity)
  reqStoreLevel: number;
}

export type CustomerState = 'ENTERING' | 'SHOPPING' | 'QUEUING' | 'PAYING' | 'LEAVING';

export interface CustomerAppearance {
  bodyColor: string;
  shirtColor: string;
  hairColor: string;
  headwear?: 'cap' | 'glasses' | 'bow' | 'none';
}

export interface SpeechBubble {
  text: string;
  icon?: string;
  type: 'need' | 'happy' | 'angry' | 'money';
  timer: number;
}

export interface Customer {
  id: string;
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: CustomerState;
  desiredProduct: ProductId;
  hasItem: boolean;
  shoppingProgress: number; // 0 to 1
  payingProgress: number; // 0 to 1
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
  totalCogs: number; // Cost of Goods Sold
  totalSalaries: number;
  totalUpgrades: number;
  netProfit: number;
  customersServed: number;
  customersWalkedAway: number;
  itemsSold: Record<ProductId, number>;
}

export interface StoreProgression {
  storeName: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  day: number;
  timeOfDay: number; // 0 to 24 in-game hours
  isPaused: boolean;
  gameSpeed: number; // 1, 2, 5
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

export interface GameSaveSchemaV1 {
  version: 1;
  timestamp: number;
  stats: FinancialStats;
  progression: StoreProgression;
  products: Product[];
  staff: StaffMember[];
  upgrades: Upgrade[];
  achievements: Achievement[];
  hasCompletedTutorial: boolean;
}
