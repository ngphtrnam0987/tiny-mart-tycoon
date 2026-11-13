import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { renderGameWorld } from '../../game/rendering/canvasRenderer';
import { SHELF_LOCATIONS, CHECKOUT_COUNTER } from '../../data/initialData';
import { Zap, Flame, Clock } from 'lucide-react';

export const GameViewport: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredShelfId, setHoveredShelfId] = useState<string | undefined>(undefined);

  const tick = useGameStore((state) => state.tick);
  const products = useGameStore((state) => state.products);
  const progression = useGameStore((state) => state.progression);
  const rushHourTimeRemaining = useGameStore((state) => state.rushHourTimeRemaining);
  const rushHourCooldown = useGameStore((state) => state.rushHourCooldown);
  const activateRushHour = useGameStore((state) => state.activateRushHour);
  const manualRegisterClick = useGameStore((state) => state.manualRegisterClick);
  const buyProductStock = useGameStore((state) => state.buyProductStock);
  const setActiveTab = useGameStore((state) => state.setActiveTab);

  // Canvas game loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaMs = currentTime - lastTime;
      lastTime = currentTime;

      const deltaSeconds = Math.min(0.1, deltaMs / 1000);

      tick(deltaSeconds);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const storeState = useGameStore.getState();
          renderGameWorld({
            ctx,
            width: canvas.width,
            height: canvas.height,
            customers: storeState.customers,
            products: storeState.products,
            staff: storeState.staff,
            decorations: storeState.decorations,
            particles: storeState.particles,
            hoveredShelfId,
            gameTime: storeState.gameTime,
            timeOfDay: storeState.progression.timeOfDay,
            isRushHour: storeState.rushHourTimeRemaining > 0,
          });
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [tick, hoveredShelfId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked register area
    const distToRegister = Math.hypot(clickX - CHECKOUT_COUNTER.x, clickY - CHECKOUT_COUNTER.y);
    if (distToRegister < 65) {
      manualRegisterClick();
      return;
    }

    // Check if clicked vending machine (x: 485, y: 480)
    const distToVending = Math.hypot(clickX - 485, clickY - 480);
    if (distToVending < 30) {
      manualRegisterClick();
      return;
    }

    for (const [, shelf] of Object.entries(SHELF_LOCATIONS)) {
      if (
        clickX >= shelf.x &&
        clickX <= shelf.x + shelf.width &&
        clickY >= shelf.y &&
        clickY <= shelf.y + shelf.height
      ) {
        const prod = products.find((p) => p.id === shelf.productId);
        if (prod && prod.isUnlocked) {
          const bought = buyProductStock(shelf.productId, 5);
          if (!bought) {
            setActiveTab('products');
          }
        }
        return;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let foundShelf: string | undefined = undefined;
    for (const [, shelf] of Object.entries(SHELF_LOCATIONS)) {
      if (
        mouseX >= shelf.x &&
        mouseX <= shelf.x + shelf.width &&
        mouseY >= shelf.y &&
        mouseY <= shelf.y + shelf.height
      ) {
        foundShelf = shelf.id;
        break;
      }
    }
    setHoveredShelfId(foundShelf);
  };

  const hours = Math.floor(progression.timeOfDay);
  const minutes = Math.floor((progression.timeOfDay % 1) * 60);
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${
    hours >= 12 ? 'PM' : 'AM'
  }`;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-white border-2 border-amber-200/80 shadow-md">
      {/* Top Game Tip Banner & Dynamic Clock */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 gap-2">
        <div className="flex items-center gap-2">
          {/* In-game Clock */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Day {progression.day} &bull; {formattedTime}
            </span>
          </div>

          {/* Rush Hour Promo Indicator */}
          {rushHourTimeRemaining > 0 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-md animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>RUSH HOUR: {Math.ceil(rushHourTimeRemaining)}s (3x Traffic)</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Rush hour campaign button */}
          <button
            onClick={activateRushHour}
            disabled={rushHourTimeRemaining > 0 || rushHourCooldown > 0}
            className={`text-xs font-black px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1 transition-all active:scale-95 ${
              rushHourTimeRemaining > 0
                ? 'bg-rose-500 text-white animate-pulse'
                : rushHourCooldown > 0
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-red-500/25'
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>
              {rushHourTimeRemaining > 0
                ? 'Rush Active!'
                : rushHourCooldown > 0
                ? `Rush CD: ${Math.ceil(rushHourCooldown)}s`
                : 'Promo Rush Hour'}
            </span>
          </button>

          {/* Speed Boost Button */}
          <button
            onClick={manualRegisterClick}
            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1 transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Speed Boost Register</span>
          </button>
        </div>
      </div>

      {/* 2D Canvas */}
      <div className="w-full flex items-center justify-center p-2 bg-[#f4ebd0]/40">
        <canvas
          ref={canvasRef}
          width={800}
          height={540}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredShelfId(undefined)}
          className="w-full max-w-[800px] h-auto aspect-[800/540] rounded-xl shadow-inner cursor-pointer"
        />
      </div>
    </div>
  );
};
