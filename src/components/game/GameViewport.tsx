import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { renderGameWorld } from '../../game/rendering/canvasRenderer';
import { SHELF_LOCATIONS, CHECKOUT_COUNTER } from '../../data/initialData';
import { Zap } from 'lucide-react';

export const GameViewport: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredShelfId, setHoveredShelfId] = useState<string | undefined>(undefined);

  const tick = useGameStore((state) => state.tick);
  const products = useGameStore((state) => state.products);
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
          renderGameWorld({
            ctx,
            width: canvas.width,
            height: canvas.height,
            customers: useGameStore.getState().customers,
            products: useGameStore.getState().products,
            staff: useGameStore.getState().staff,
            particles: useGameStore.getState().particles,
            hoveredShelfId,
            gameTime: useGameStore.getState().gameTime,
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

    const distToRegister = Math.hypot(clickX - CHECKOUT_COUNTER.x, clickY - CHECKOUT_COUNTER.y);
    if (distToRegister < 65) {
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

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-white border-2 border-amber-200/80 shadow-md">
      {/* Top Game Tip Banner */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5 bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Click shelves to restock &bull; Click checkout counter for Speed Boost!</span>
        </div>

        <button
          onClick={manualRegisterClick}
          className="pointer-events-auto bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1 transition-all"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Speed Boost Register</span>
        </button>
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
