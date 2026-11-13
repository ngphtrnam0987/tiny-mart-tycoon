import type {
  Customer,
  Product,
  StaffMember,
  FloatingParticle,
} from '../../types/game';
import {
  STORE_ENTRANCE,
  STORAGE_ROOM,
  CHECKOUT_COUNTER,
  CASHIER_STATION,
  SHELF_LOCATIONS,
} from '../../data/initialData';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  customers: Customer[];
  products: Product[];
  staff: StaffMember[];
  particles: FloatingParticle[];
  hoveredShelfId?: string;
  gameTime: number;
}

export function renderGameWorld(renderCtx: RenderContext) {
  const { ctx, width, height, customers, products, staff, particles, hoveredShelfId, gameTime } =
    renderCtx;

  ctx.clearRect(0, 0, width, height);

  drawStoreEnvironment(ctx, width, height);
  drawShelves(ctx, products, hoveredShelfId, gameTime);
  drawCheckoutCounter(ctx, staff, customers, gameTime);
  drawStorageArea(ctx, staff, gameTime);

  const sortedCustomers = [...customers].sort((a, b) => a.y - b.y);
  for (const customer of sortedCustomers) {
    drawCustomer(ctx, customer);
  }

  drawParticles(ctx, particles);
}

function drawStoreEnvironment(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, width, height);

  const storeX = 40;
  const storeY = 40;
  const storeW = width - 80;
  const storeH = height - 70;

  const tileSize = 32;
  for (let x = storeX; x < storeX + storeW; x += tileSize) {
    for (let y = storeY; y < storeY + storeH; y += tileSize) {
      const isEven = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
      ctx.fillStyle = isEven ? '#fffdf7' : '#fef5e7';
      const w = Math.min(tileSize, storeX + storeW - x);
      const h = Math.min(tileSize, storeY + storeH - y);
      ctx.fillRect(x, y, w, h);
    }
  }

  ctx.fillStyle = '#818cf8';
  ctx.fillRect(storeX, storeY - 14, storeW, 14);

  ctx.fillStyle = '#6366f1';
  ctx.fillRect(storeX, storeY, storeW, 4);

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(storeX - 6, storeY - 14, 6, storeH + 14);
  ctx.fillRect(storeX + storeW, storeY - 14, 6, storeH + 14);
  ctx.fillRect(storeX - 6, storeY + storeH, storeW + 12, 6);

  const matW = 90;
  const matH = 34;
  const matX = STORE_ENTRANCE.x - matW / 2;
  const matY = storeY + storeH - matH;

  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.roundRect(matX, matY, matW, matH, 6);
  ctx.fill();

  ctx.fillStyle = '#ea580c';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WELCOME', STORE_ENTRANCE.x, matY + 20);

  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(matX - 10, matY + matH);
  ctx.lineTo(matX + 20, matY + matH);
  ctx.moveTo(matX + matW - 20, matY + matH);
  ctx.lineTo(matX + matW + 10, matY + matH);
  ctx.stroke();
}

function drawShelves(
  ctx: CanvasRenderingContext2D,
  products: Product[],
  hoveredShelfId?: string,
  gameTime: number = 0
) {
  const prodMap = new Map(products.map((p) => [p.id, p]));

  for (const [key, shelf] of Object.entries(SHELF_LOCATIONS)) {
    const prod = prodMap.get(shelf.productId);
    const isUnlocked = prod?.isUnlocked ?? false;
    const stock = prod?.stock ?? 0;
    const maxCapacity = prod?.maxCapacity ?? 20;
    const isHovered = hoveredShelfId === shelf.id;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(shelf.x + 4, shelf.y + 6, shelf.width, shelf.height);

    if (!isUnlocked) {
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(shelf.x, shelf.y, shelf.width, shelf.height, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔒 Locked', shelf.x + shelf.width / 2, shelf.y + shelf.height / 2 + 3);
      continue;
    }

    ctx.fillStyle = isHovered ? '#fed7aa' : '#f8fafc';
    ctx.strokeStyle = isHovered ? '#f97316' : '#cbd5e1';
    ctx.lineWidth = isHovered ? 2 : 1.5;
    ctx.beginPath();
    ctx.roundRect(shelf.x, shelf.y, shelf.width, shelf.height, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = prod?.color || '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(shelf.x + 2, shelf.y + 2, shelf.width - 4, 12, [4, 4, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(prod?.name || key, shelf.x + shelf.width / 2, shelf.y + 10);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(shelf.x + 4, shelf.y + 28);
    ctx.lineTo(shelf.x + shelf.width - 4, shelf.y + 28);
    ctx.stroke();

    const stockRatio = maxCapacity > 0 ? stock / maxCapacity : 0;
    const maxVisualItems = 8;
    const visualItems = Math.min(maxVisualItems, Math.ceil(stockRatio * maxVisualItems));

    const itemW = 8;
    const itemH = 10;
    const startX = shelf.x + 8;
    const itemGap = (shelf.width - 16 - maxVisualItems * itemW) / (maxVisualItems - 1);

    for (let i = 0; i < visualItems; i++) {
      const ix = startX + i * (itemW + itemGap);
      const iy = shelf.y + 16;
      ctx.fillStyle = prod?.color || '#10b981';
      ctx.fillRect(ix, iy, itemW, itemH);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(ix + 1, iy + 1, itemW - 2, 2);
    }

    const barW = shelf.width - 12;
    const barH = 5;
    const barX = shelf.x + 6;
    const barY = shelf.y + shelf.height - 9;

    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 2);
    ctx.fill();

    let barColor = '#22c55e';
    if (stockRatio < 0.25) barColor = '#ef4444';
    else if (stockRatio < 0.5) barColor = '#f59e0b';

    ctx.fillStyle = barColor;
    ctx.beginPath();
    ctx.roundRect(barX, barY, Math.max(0, barW * stockRatio), barH, 2);
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${stock}/${maxCapacity}`, shelf.x + shelf.width - 6, shelf.y + shelf.height - 12);

    if (stock === 0) {
      const pulse = Math.sin(gameTime * 6) * 2;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(shelf.x + shelf.width / 2 - 28, shelf.y + 16 + pulse, 56, 16, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OUT OF STOCK', shelf.x + shelf.width / 2, shelf.y + 28 + pulse);
    }
  }
}

function drawCheckoutCounter(
  ctx: CanvasRenderingContext2D,
  staff: StaffMember[],
  customers: Customer[],
  gameTime: number
) {
  const counter = CHECKOUT_COUNTER;
  const cashier = staff.find((s) => s.type === 'cashier' && s.hired);
  const isCustomerPaying = customers.some((c) => c.state === 'PAYING');

  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fillRect(counter.x - 45, counter.y - 15, 90, 45);

  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.roundRect(counter.x - 45, counter.y - 20, 90, 40, 6);
  ctx.fill();

  ctx.fillStyle = '#334155';
  ctx.fillRect(counter.x - 40, counter.y - 16, 50, 32);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(counter.x + 15, counter.y - 18, 25, 22);

  ctx.fillStyle = isCustomerPaying ? '#4ade80' : '#38bdf8';
  ctx.fillRect(counter.x + 18, counter.y - 15, 19, 14);

  if (isCustomerPaying) {
    const flash = Math.sin(gameTime * 15) > 0;
    if (flash) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(counter.x - 20, counter.y - 5);
      ctx.lineTo(counter.x + 10, counter.y - 5);
      ctx.stroke();
    }
  }

  if (cashier && cashier.active) {
    const cashierBob = isCustomerPaying ? Math.sin(gameTime * 10) * 1.5 : 0;
    const cx = CASHIER_STATION.x;
    const cy = CASHIER_STATION.y + cashierBob;

    ctx.fillStyle = cashier.avatarColor || '#3b82f6';
    ctx.beginPath();
    ctx.arc(cx, cy, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(cx, cy - 3, 10, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx + 4, cy - 1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx + 4.5, cy - 1, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(cx - 5, cy + 4, 6, 4);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Cashier', cx, cy - 14);
  } else {
    ctx.fillStyle = '#64748b';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('(Self-Checkout)', counter.x, counter.y + 32);
  }
}

function drawStorageArea(
  ctx: CanvasRenderingContext2D,
  staff: StaffMember[],
  gameTime: number
) {
  const stocker = staff.find((s) => s.type === 'stocker' && s.hired);
  const manager = staff.find((s) => s.type === 'manager' && s.hired);

  ctx.fillStyle = '#f1f5f9';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(STORAGE_ROOM.x - 25, STORAGE_ROOM.y - 25, 95, 75, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📦 INVENTORY', STORAGE_ROOM.x + 22, STORAGE_ROOM.y - 12);

  ctx.fillStyle = '#b45309';
  ctx.fillRect(STORAGE_ROOM.x - 15, STORAGE_ROOM.y + 5, 20, 18);
  ctx.fillRect(STORAGE_ROOM.x + 8, STORAGE_ROOM.y + 12, 18, 16);
  ctx.fillRect(STORAGE_ROOM.x - 8, STORAGE_ROOM.y + 25, 22, 16);

  if (stocker && stocker.active) {
    const sx = STORAGE_ROOM.x + 48;
    const sy = STORAGE_ROOM.y + 22 + Math.sin(gameTime * 4) * 2;

    ctx.fillStyle = stocker.avatarColor || '#10b981';
    ctx.beginPath();
    ctx.arc(sx, sy, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(sx + 3, sy - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d97706';
    ctx.fillRect(sx + 5, sy - 4, 9, 8);

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Stocker', sx, sy - 13);
  }

  if (manager && manager.active) {
    const mx = 370 + Math.sin(gameTime * 0.8) * 45;
    const my = 230 + Math.cos(gameTime * 0.6) * 35;

    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(mx, my, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx - 2, my + 6);
    ctx.lineTo(mx + 2, my + 6);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(mx + 7, my - 3, 7, 10);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(mx + 7, my - 3, 7, 10);

    ctx.fillStyle = '#6b21a8';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Manager ⭐', mx, my - 14);
  }
}

function drawCustomer(ctx: CanvasRenderingContext2D, customer: Customer) {
  const { x, y, appearance, walkFrame, state, speechBubble, shoppingProgress, payingProgress } =
    customer;
  const bob = Math.sin(walkFrame) * 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.ellipse(x, y + 4, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const charY = y + bob;

  ctx.fillStyle = appearance.shirtColor;
  ctx.beginPath();
  ctx.arc(x, charY, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = appearance.bodyColor;
  ctx.beginPath();
  ctx.arc(x, charY - 6, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = appearance.hairColor;
  ctx.beginPath();
  ctx.arc(x, charY - 9, 8, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(x - 2.5, charY - 6, 1.2, 0, Math.PI * 2);
  ctx.arc(x + 2.5, charY - 6, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (customer.frustrated) {
    ctx.arc(x, charY - 2, 2.5, Math.PI, 0);
  } else {
    ctx.arc(x, charY - 4, 2.5, 0, Math.PI);
  }
  ctx.stroke();

  if (customer.hasItem) {
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 6, charY - 2, 7, 7);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 7, charY - 4, 5, 3);
  }

  if (state === 'SHOPPING' && shoppingProgress > 0) {
    drawProgressBar(ctx, x - 14, charY - 24, 28, 4, shoppingProgress, '#3b82f6');
  } else if (state === 'PAYING' && payingProgress > 0) {
    drawProgressBar(ctx, x - 14, charY - 24, 28, 4, payingProgress, '#10b981');
  }

  if (speechBubble) {
    drawSpeechBubble(ctx, x, charY - 22, speechBubble.text, speechBubble.type);
  }
}

function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  progress: number,
  color: string
) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, Math.max(2, w * Math.min(1, progress)), h, 2);
  ctx.fill();
}

function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  type: 'need' | 'happy' | 'angry' | 'money'
) {
  ctx.font = 'bold 9px sans-serif';
  const textWidth = ctx.measureText(text).width;
  const bubbleW = Math.max(34, textWidth + 12);
  const bubbleH = 16;
  const bx = x - bubbleW / 2;
  const by = y - bubbleH;

  let bgColor = '#ffffff';
  let textColor = '#1e293b';
  let borderColor = '#e2e8f0';

  if (type === 'happy') {
    bgColor = '#dcfce7';
    textColor = '#15803d';
    borderColor = '#86efac';
  } else if (type === 'angry') {
    bgColor = '#fee2e2';
    textColor = '#b91c1c';
    borderColor = '#fca5a5';
  }

  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx, by, bubbleW, bubbleH, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.moveTo(x - 3, by + bubbleH);
  ctx.lineTo(x, by + bubbleH + 4);
  ctx.lineTo(x + 3, by + bubbleH);
  ctx.fill();

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, by + 11);
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: FloatingParticle[]) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.opacity);
    ctx.fillStyle = p.color;
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  }
}
