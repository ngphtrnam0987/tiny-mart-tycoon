import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Volume2,
  VolumeX,
  Music,
  Play,
  Pause,
  FastForward,
  Sparkles,
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const TopHud: React.FC = () => {
  const stats = useGameStore((state) => state.stats);
  const progression = useGameStore((state) => state.progression);
  const customers = useGameStore((state) => state.customers);
  const isMuted = useGameStore((state) => state.isMuted);
  const isMusicPlaying = useGameStore((state) => state.isMusicPlaying);

  const togglePause = useGameStore((state) => state.togglePause);
  const setGameSpeed = useGameStore((state) => state.setGameSpeed);
  const toggleMute = useGameStore((state) => state.toggleMute);
  const toggleMusic = useGameStore((state) => state.toggleMusic);

  const xpProgress = Math.min(100, Math.round((progression.xp / progression.xpToNextLevel) * 100));

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-amber-200/60 px-4 py-2.5 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Store Brand & Level */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white font-black shadow-md shadow-amber-500/20 text-lg">
            🏪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-800 text-base tracking-tight leading-none">
                {progression.storeName}
              </h1>
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
                LVL {progression.level}
              </span>
            </div>
            {/* XP Bar */}
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                <div
                  className="bg-amber-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-400">
                {progression.xp}/{progression.xpToNextLevel} XP
              </span>
            </div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Current Cash */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-1.5 shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-xs">
              <DollarSign className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Cash</p>
              <p className="text-sm sm:text-base font-black text-emerald-800 leading-none">
                ${stats.cash.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Revenue */}
          <div className="hidden md:flex items-center gap-1.5 bg-sky-50 border border-sky-200/80 rounded-xl px-3 py-1.5 shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-xs">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-sky-600">Revenue</p>
              <p className="text-sm font-black text-sky-800 leading-none">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Net Profit */}
          <div className="hidden lg:flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-1.5 shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600">Profit</p>
              <p
                className={`text-sm font-black leading-none ${
                  stats.netProfit >= 0 ? 'text-amber-800' : 'text-rose-600'
                }`}
              >
                ${stats.netProfit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Active Customers */}
          <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200/80 rounded-xl px-3 py-1.5 shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-purple-500 flex items-center justify-center text-white shadow-xs">
              <Users className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-purple-600">Shoppers</p>
              <p className="text-sm font-black text-purple-800 leading-none">
                {customers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Speed & Audio Controls */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={togglePause}
            title={progression.isPaused ? 'Resume Game' : 'Pause Game'}
            className={`p-1.5 rounded-lg transition-all ${
              progression.isPaused
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200 active:scale-95'
            }`}
          >
            {progression.isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setGameSpeed(1)}
            title="Normal Speed"
            className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
              !progression.isPaused && progression.gameSpeed === 1
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1x
          </button>

          <button
            onClick={() => setGameSpeed(2)}
            title="Fast Speed (2x)"
            className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
              !progression.isPaused && progression.gameSpeed === 2
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            2x
          </button>

          <button
            onClick={() => setGameSpeed(5)}
            title="Super Fast Speed (5x)"
            className={`px-2 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-0.5 ${
              !progression.gameSpeed || progression.gameSpeed === 5
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FastForward className="w-3 h-3" />
            5x
          </button>

          <div className="w-[1px] h-4 bg-slate-300 mx-0.5" />

          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            className={`p-1.5 rounded-lg transition-all ${
              isMuted
                ? 'bg-rose-100 text-rose-600'
                : 'text-slate-600 hover:bg-slate-200 active:scale-95'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleMusic}
            title={isMusicPlaying ? 'Stop Cozy Music' : 'Play Cozy Music'}
            className={`p-1.5 rounded-lg transition-all ${
              isMusicPlaying
                ? 'bg-purple-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200 active:scale-95'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
