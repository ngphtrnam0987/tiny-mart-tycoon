import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const AchievementsPanel: React.FC = () => {
  const achievements = useGameStore((state) => state.achievements);

  const completedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800">Business Milestones & Achievements</h2>
          <p className="text-xs text-slate-500">
            Reach key retail milestones to claim bonus startup capital and store XP.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs px-3 py-1 rounded-xl">
          {completedCount} / {achievements.length} Unlocked
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {achievements.map((ach) => {
          const progressPercent = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

          return (
            <div
              key={ach.id}
              className={`rounded-2xl border p-4 transition-all flex items-start gap-3.5 ${
                ach.isUnlocked
                  ? 'bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border-emerald-200'
                  : 'bg-white border-slate-200/90'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  ach.isUnlocked
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {ach.isUnlocked ? (
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                ) : (
                  <Award className="w-6 h-6 stroke-[1.8]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-slate-800 text-sm leading-tight truncate">
                    {ach.title}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="bg-amber-100 text-amber-900 font-extrabold text-[11px] px-2 py-0.5 rounded-lg border border-amber-300">
                      +${ach.rewardCash}
                    </span>
                    <span className="bg-purple-100 text-purple-900 font-bold text-[11px] px-2 py-0.5 rounded-lg">
                      +{ach.rewardXp} XP
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-1">{ach.description}</p>

                {/* Progress bar */}
                <div className="mt-2.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>
                      {ach.progress} / {ach.maxProgress}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        ach.isUnlocked ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
