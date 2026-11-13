import React from 'react';
import {
  ShoppingBag,
  Users,
  Layers,
  BarChart3,
  Award,
  Settings,
} from 'lucide-react';
import { useGameStore } from './store/useGameStore';
import type { ManagementTab } from './store/useGameStore';
import { TopHud } from './components/hud/TopHud';
import { GameViewport } from './components/game/GameViewport';
import { ProductsPanel } from './components/panels/ProductsPanel';
import { StaffPanel } from './components/panels/StaffPanel';
import { UpgradesPanel } from './components/panels/UpgradesPanel';
import { StatsPanel } from './components/panels/StatsPanel';
import { AchievementsPanel } from './components/panels/AchievementsPanel';
import { SettingsPanel } from './components/panels/SettingsPanel';
import { OfflineModal } from './components/ui/OfflineModal';
import { TutorialModal } from './components/ui/TutorialModal';

export function App() {
  const activeTab = useGameStore((state) => state.activeTab);
  const setActiveTab = useGameStore((state) => state.setActiveTab);
  const products = useGameStore((state) => state.products);
  const staff = useGameStore((state) => state.staff);
  const achievements = useGameStore((state) => state.achievements);

  const emptyShelvesCount = products.filter((p) => p.isUnlocked && p.stock === 0).length;
  const hiredStaffCount = staff.filter((s) => s.hired).length;
  const unlockedAchCount = achievements.filter((a) => a.isUnlocked).length;

  const tabs: Array<{
    id: ManagementTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    {
      id: 'products',
      label: 'Products',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: emptyShelvesCount > 0 ? `${emptyShelvesCount} empty` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'staff',
      label: 'Staff',
      icon: <Users className="w-4 h-4" />,
      badge: `${hiredStaffCount}/3`,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'upgrades',
      label: 'Upgrades',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'stats',
      label: 'Statistics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'achievements',
      label: 'Goals',
      icon: <Award className="w-4 h-4" />,
      badge: `${unlockedAchCount}/${achievements.length}`,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-slate-800 flex flex-col font-sans antialiased selection:bg-amber-200">
      <TopHud />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 space-y-6">
        <section aria-label="Game World">
          <GameViewport />
        </section>

        <section
          aria-label="Store Management"
          className="bg-white/80 backdrop-blur-md rounded-3xl border border-amber-200/60 shadow-sm p-4 sm:p-6 space-y-5"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-1">
            {activeTab === 'products' && <ProductsPanel />}
            {activeTab === 'staff' && <StaffPanel />}
            {activeTab === 'upgrades' && <UpgradesPanel />}
            {activeTab === 'stats' && <StatsPanel />}
            {activeTab === 'achievements' && <AchievementsPanel />}
            {activeTab === 'settings' && <SettingsPanel />}
          </div>
        </section>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 font-medium border-t border-slate-200/50 mt-auto">
        Tiny Mart Tycoon &bull; Cozy Shop Management Simulator &bull; Built with React, Vite & HTML5 Canvas
      </footer>

      <OfflineModal />
      <TutorialModal />
    </div>
  );
}

export default App;
