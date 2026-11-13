import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Smile,
  Frown,
  PackageCheck,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const StatsPanel: React.FC = () => {
  const stats = useGameStore((state) => state.stats);
  const products = useGameStore((state) => state.products);

  const totalInteractions = stats.customersServed + stats.customersWalkedAway;
  const satisfactionRate =
    totalInteractions > 0 ? Math.round((stats.customersServed / totalInteractions) * 100) : 100;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800">Financial & Operational Analytics</h2>
        <p className="text-xs text-slate-500">
          Track revenue, expenses, customer satisfaction, and unit sales volume.
        </p>
      </div>

      {/* Income Statement Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Gross Revenue */}
        <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-sky-600 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Gross Revenue</span>
          </div>
          <p className="mt-1.5 text-xl font-black text-sky-900 leading-none">
            ${stats.totalRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-sky-600 font-medium mt-1 block">From item sales</span>
        </div>

        {/* COGS */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs uppercase tracking-wider">
            <TrendingDown className="w-4 h-4" />
            <span>Cost of Goods</span>
          </div>
          <p className="mt-1.5 text-xl font-black text-amber-900 leading-none">
            ${stats.totalCogs.toLocaleString()}
          </p>
          <span className="text-[10px] text-amber-600 font-medium mt-1 block">Inventory purchases</span>
        </div>

        {/* Salaries */}
        <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3.5">
          <div className="flex items-center gap-1.5 text-purple-600 font-bold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Staff Payroll</span>
          </div>
          <p className="mt-1.5 text-xl font-black text-purple-900 leading-none">
            ${stats.totalSalaries.toLocaleString()}
          </p>
          <span className="text-[10px] text-purple-600 font-medium mt-1 block">Wages paid</span>
        </div>

        {/* Net Profit */}
        <div
          className={`rounded-2xl p-3.5 border ${
            stats.netProfit >= 0
              ? 'bg-emerald-50/70 border-emerald-200/80'
              : 'bg-rose-50/70 border-rose-200/80'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider ${
              stats.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Net Profit</span>
          </div>
          <p
            className={`mt-1.5 text-xl font-black leading-none ${
              stats.netProfit >= 0 ? 'text-emerald-900' : 'text-rose-900'
            }`}
          >
            ${stats.netProfit.toLocaleString()}
          </p>
          <span
            className={`text-[10px] font-medium mt-1 block ${
              stats.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            Revenue minus all costs
          </span>
        </div>
      </div>

      {/* Customer Satisfaction & Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Served */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Customers Served</p>
            <p className="text-lg font-black text-slate-800">{stats.customersServed}</p>
          </div>
        </div>

        {/* Walked Away */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Frown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Lost Customers (Out of Stock)</p>
            <p className="text-lg font-black text-slate-800">{stats.customersWalkedAway}</p>
          </div>
        </div>

        {/* Satisfaction */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
            %
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Satisfaction Rate</p>
            <p className="text-lg font-black text-slate-800">{satisfactionRate}%</p>
          </div>
        </div>
      </div>

      {/* Product Sales Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <h3 className="font-extrabold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-amber-500" />
          <span>Product Sales Volume</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {products.map((prod) => {
            const units = stats.itemsSold[prod.id] || 0;
            return (
              <div
                key={prod.id}
                className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center"
              >
                <div
                  className="w-7 h-7 rounded-lg text-white mx-auto flex items-center justify-center text-xs font-bold shadow-xs mb-1.5"
                  style={{ backgroundColor: prod.color }}
                >
                  {prod.name[0]}
                </div>
                <p className="font-bold text-slate-700 text-xs truncate">{prod.name}</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{units} sold</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
