import React from 'react';
import {
  Cookie,
  CupSoda,
  Package,
  Apple,
  Croissant,
  Smartphone,
  Lock,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import type { ProductId } from '../../types/game';

const ICON_MAP: Record<string, React.ReactNode> = {
  Cookie: <Cookie className="w-5 h-5" />,
  CupSoda: <CupSoda className="w-5 h-5" />,
  Package: <Package className="w-5 h-5" />,
  Apple: <Apple className="w-5 h-5" />,
  Croissant: <Croissant className="w-5 h-5" />,
  Smartphone: <Smartphone className="w-5 h-5" />,
};

export const ProductsPanel: React.FC = () => {
  const products = useGameStore((state) => state.products);
  const stats = useGameStore((state) => state.stats);
  const progression = useGameStore((state) => state.progression);
  const buyProductStock = useGameStore((state) => state.buyProductStock);
  const unlockProduct = useGameStore((state) => state.unlockProduct);

  const handleRestock = (productId: ProductId, qty: number) => {
    buyProductStock(productId, qty);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800">Inventory & Shelf Management</h2>
          <p className="text-xs text-slate-500">
            Keep shelves stocked to maximize sales and avoid angry customers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((product) => {
          const isUnlocked = product.isUnlocked;
          const spaceAvailable = product.maxCapacity - product.stock;
          const stockRatio = product.stock / product.maxCapacity;
          const profitMargin = product.salePrice - product.costPrice;

          return (
            <div
              key={product.id}
              className={`rounded-2xl border p-4 transition-all relative overflow-hidden ${
                isUnlocked
                  ? 'bg-white border-slate-200/90 shadow-xs hover:shadow-md'
                  : 'bg-slate-50/80 border-dashed border-slate-300 opacity-90'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: product.color }}
                  >
                    {ICON_MAP[product.iconName] || <Package className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">
                      {product.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                  </div>
                </div>

                {isUnlocked && (
                  <span className="bg-emerald-50 text-emerald-700 font-black text-xs px-2 py-0.5 rounded-lg border border-emerald-200">
                    +${profitMargin}
                  </span>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Cost</span>
                  <span className="font-bold text-slate-700">${product.costPrice} / unit</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Retail Price</span>
                  <span className="font-extrabold text-emerald-700">${product.salePrice} / unit</span>
                </div>
              </div>

              {isUnlocked ? (
                <>
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span className="text-slate-500">In Stock</span>
                      <span
                        className={
                          product.stock === 0
                            ? 'text-rose-600 font-extrabold'
                            : product.stock < product.maxCapacity * 0.3
                            ? 'text-amber-600'
                            : 'text-slate-700'
                        }
                      >
                        {product.stock} / {product.maxCapacity} units
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          stockRatio < 0.25
                            ? 'bg-rose-500'
                            : stockRatio < 0.5
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.round(stockRatio * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3.5 grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleRestock(product.id, 5)}
                      disabled={spaceAvailable < 5 || stats.cash < product.costPrice * 5}
                      className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 disabled:opacity-40 disabled:hover:bg-amber-50 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition-all flex flex-col items-center justify-center active:scale-95"
                    >
                      <span>+5</span>
                      <span className="text-[10px] font-semibold text-amber-700">
                        ${product.costPrice * 5}
                      </span>
                    </button>

                    <button
                      onClick={() => handleRestock(product.id, 10)}
                      disabled={spaceAvailable < 10 || stats.cash < product.costPrice * 10}
                      className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 disabled:opacity-40 disabled:hover:bg-amber-50 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition-all flex flex-col items-center justify-center active:scale-95"
                    >
                      <span>+10</span>
                      <span className="text-[10px] font-semibold text-amber-700">
                        ${product.costPrice * 10}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        const affordable = Math.floor(stats.cash / product.costPrice);
                        const toBuy = Math.min(spaceAvailable, affordable);
                        if (toBuy > 0) handleRestock(product.id, toBuy);
                      }}
                      disabled={spaceAvailable <= 0 || stats.cash < product.costPrice}
                      className="py-1.5 px-2 bg-gradient-to-tr from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex flex-col items-center justify-center active:scale-95"
                    >
                      <span>MAX</span>
                      <span className="text-[10px] font-semibold text-amber-100">
                        {spaceAvailable <= 0
                          ? 'Full'
                          : `$${Math.min(spaceAvailable, Math.floor(stats.cash / product.costPrice)) * product.costPrice}`}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Requires Store Level {product.unlockStoreLevel}</span>
                  </div>

                  <button
                    onClick={() => unlockProduct(product.id)}
                    disabled={
                      progression.level < product.unlockStoreLevel || stats.cash < product.unlockCost
                    }
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:hover:from-purple-600 disabled:hover:to-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    Unlock Shelf (${product.unlockCost})
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
