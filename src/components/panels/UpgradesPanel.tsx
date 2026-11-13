import React from 'react';
import {
  Layers,
  Zap,
  TrendingUp,
  Truck,
  Coffee,
  Percent,
  Maximize2,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { calculateUpgradeCost } from '../../game/economy/economySystem';

const UPGRADE_ICONS: Record<string, React.ReactNode> = {
  shelf_capacity: <Layers className="w-5 h-5 text-indigo-500" />,
  checkout_speed: <Zap className="w-5 h-5 text-amber-500" />,
  customer_attraction: <TrendingUp className="w-5 h-5 text-emerald-500" />,
  stocker_efficiency: <Truck className="w-5 h-5 text-sky-500" />,
  employee_breakroom: <Coffee className="w-5 h-5 text-rose-500" />,
  profit_optimization: <Percent className="w-5 h-5 text-purple-500" />,
  shop_expansion: <Maximize2 className="w-5 h-5 text-orange-500" />,
};

export const UpgradesPanel: React.FC = () => {
  const upgrades = useGameStore((state) => state.upgrades);
  const stats = useGameStore((state) => state.stats);
  const buyUpgrade = useGameStore((state) => state.buyUpgrade);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800">Store Upgrades & Enhancements</h2>
        <p className="text-xs text-slate-500">
          Invest your profits into facility upgrades to scale throughput, capacity, and profitability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {upgrades.map((upgrade) => {
          const isMaxed = upgrade.level >= upgrade.maxLevel;
          const currentCost = calculateUpgradeCost(
            upgrade.baseCost,
            upgrade.costMultiplier,
            upgrade.level
          );
          const canAfford = stats.cash >= currentCost && !isMaxed;

          return (
            <div
              key={upgrade.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      {UPGRADE_ICONS[upgrade.id] || <Layers className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm leading-tight">
                        {upgrade.name}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {upgrade.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`font-black text-xs px-2 py-0.5 rounded-full ${
                      isMaxed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isMaxed ? 'MAX' : `Lvl ${upgrade.level}/${upgrade.maxLevel}`}
                  </span>
                </div>

                <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                  {upgrade.description}
                </p>

                {/* Level progress dots */}
                <div className="mt-3 flex items-center gap-1">
                  {Array.from({ length: upgrade.maxLevel }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < upgrade.level ? 'bg-amber-400' : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {isMaxed ? (
                  <div className="w-full py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Maxed Out</span>
                  </div>
                ) : (
                  <button
                    onClick={() => buyUpgrade(upgrade.id)}
                    disabled={!canAfford}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 active:scale-95"
                  >
                    <span>Upgrade</span>
                    <span className="font-medium text-amber-100">(${currentCost.toLocaleString()})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
