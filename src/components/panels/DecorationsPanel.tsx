import React from 'react';
import {
  Flower2,
  Milk,
  SunMedium,
  Coffee,
  Sparkles,
  Check,
  Lock,
  Flame,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

const DECORATION_ICONS: Record<string, React.ReactNode> = {
  Flower2: <Flower2 className="w-6 h-6 text-emerald-500" />,
  Milk: <Milk className="w-6 h-6 text-rose-500" />,
  SunMedium: <SunMedium className="w-6 h-6 text-amber-500" />,
  Coffee: <Coffee className="w-6 h-6 text-yellow-600" />,
  Sparkles: <Sparkles className="w-6 h-6 text-purple-500" />,
};

export const DecorationsPanel: React.FC = () => {
  const decorations = useGameStore((state) => state.decorations);
  const stats = useGameStore((state) => state.stats);
  const progression = useGameStore((state) => state.progression);
  const buyDecoration = useGameStore((state) => state.buyDecoration);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800">Store Decor & Boutique Ambiance</h2>
        <p className="text-xs text-slate-500">
          Transform your mart with aesthetic furniture, indoor greenery, warm lighting, and passive bonus machines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {decorations.map((item) => {
          const isPurchased = item.isPurchased;
          const isLevelLocked = progression.level < item.reqLevel;
          const canAfford = stats.cash >= item.cost && !isLevelLocked && !isPurchased;

          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all ${
                isPurchased
                  ? 'bg-gradient-to-tr from-emerald-50/70 to-teal-50/50 border-emerald-300 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:shadow-md'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs">
                      {DECORATION_ICONS[item.icon] || <Sparkles className="w-6 h-6 text-amber-500" />}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm leading-tight">
                        {item.name}
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-1">
                        {item.passiveBonus}
                      </span>
                    </div>
                  </div>

                  {isPurchased && (
                    <span className="bg-emerald-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                      Installed
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {isPurchased ? (
                  <div className="w-full py-2 bg-emerald-100/70 text-emerald-800 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Active in Mart</span>
                  </div>
                ) : isLevelLocked ? (
                  <div className="w-full py-2 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Requires Level {item.reqLevel}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => buyDecoration(item.id)}
                    disabled={!canAfford}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Install Decor (${item.cost.toLocaleString()})</span>
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
