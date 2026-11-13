import React from 'react';
import { Sparkles, Clock, Package, Users } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const OfflineModal: React.FC = () => {
  const offlineSummary = useGameStore((state) => state.offlineSummary);
  const dismissOfflineModal = useGameStore((state) => state.dismissOfflineModal);

  if (!offlineSummary) return null;

  const hours = Math.floor(offlineSummary.offlineSeconds / 3600);
  const minutes = Math.floor((offlineSummary.offlineSeconds % 3600) / 60);
  const timeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-200 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-md text-2xl">
            🎉
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Welcome Back, Boss!</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>You were away for {timeFormatted}</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="mt-5 bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              Units Sold:
            </span>
            <span className="font-bold text-slate-800">{offlineSummary.unitsSold} items</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Gross Revenue:</span>
            <span className="font-extrabold text-emerald-700">
              +${offlineSummary.grossRevenue.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Cost of Goods (COGS):</span>
            <span className="font-bold text-amber-700">
              -${offlineSummary.cogs.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Staff Wages Paid:
            </span>
            <span className="font-bold text-purple-700">
              -${offlineSummary.salaries.toLocaleString()}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            <span className="font-black text-slate-800 text-sm">Net Profit Earned:</span>
            <span
              className={`font-black text-lg ${
                offlineSummary.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              +${offlineSummary.netProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Collect button */}
        <button
          onClick={dismissOfflineModal}
          className="mt-5 w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Collect Offline Earnings</span>
        </button>
      </div>
    </div>
  );
};
