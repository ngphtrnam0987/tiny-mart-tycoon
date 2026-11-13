import React from 'react';
import {
  UserCheck,
  Zap,
  ArrowUpCircle,
  Clock,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const StaffPanel: React.FC = () => {
  const staff = useGameStore((state) => state.staff);
  const stats = useGameStore((state) => state.stats);
  const hireStaff = useGameStore((state) => state.hireStaff);
  const upgradeStaff = useGameStore((state) => state.upgradeStaff);

  const getStaffDescription = (type: string) => {
    switch (type) {
      case 'cashier':
        return 'Takes customer payments at the register automatically. Higher levels drastically speed up queue processing.';
      case 'stocker':
        return 'Continuously inspects mart shelves. When stock falls below 40%, automatically purchases and stocks inventory from store cash.';
      case 'manager':
        return 'Oversees store operations. Provides a +25% speed bonus to Cashier and Stocker, plus triggers extra customer foot traffic!';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-800">Staff & Mart Automation</h2>
        <p className="text-xs text-slate-500">
          Hire employees to run your mart autonomously while you focus on growth and upgrades.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {staff.map((member) => {
          const upgradeCost = Math.round(member.upgradeCost * Math.pow(1.5, member.level - 1));
          const currentSalary = Math.round(member.baseSalaryPerMin * (1 + (member.level - 1) * 0.25));

          return (
            <div
              key={member.id}
              className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all ${
                member.hired
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-slate-50/80 border-slate-200/80'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm font-black text-lg"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name[0]}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">{member.name}</h3>
                      <p className="text-[11px] font-bold text-slate-500">{member.title}</p>
                    </div>
                  </div>

                  {member.hired ? (
                    <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-300">
                      Level {member.level}
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-600 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Available
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {getStaffDescription(member.type)}
                </p>

                {/* Automation Stats */}
                <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Speed Factor:
                    </span>
                    <span className="font-bold text-slate-800">
                      {member.hired ? `${member.workSpeed.toFixed(1)}x` : '1.0x'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-sky-500" /> Salary:
                    </span>
                    <span className="font-bold text-slate-800">${currentSalary} / min</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {member.hired ? (
                  <button
                    onClick={() => upgradeStaff(member.id)}
                    disabled={stats.cash < upgradeCost}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    <span>Train to Level {member.level + 1} (${upgradeCost})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => hireStaff(member.id)}
                    disabled={stats.cash < member.hiringCost}
                    className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Hire Employee (${member.hiringCost})</span>
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
