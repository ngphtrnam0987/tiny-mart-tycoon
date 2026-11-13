import React from 'react';
import { ArrowRight, X, Store, ShoppingBag, Sparkles, Bot } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export const TutorialModal: React.FC = () => {
  const tutorialStep = useGameStore((state) => state.tutorialStep);
  const advanceTutorial = useGameStore((state) => state.advanceTutorial);
  const setActiveTab = useGameStore((state) => state.setActiveTab);

  if (tutorialStep >= 4) return null;

  const steps = [
    {
      title: 'Welcome to Tiny Mart Tycoon! 🏪',
      desc: 'You just inherited a cute neighborhood mini-mart with $200 startup capital. Ready to build your retail empire?',
      actionText: "Let's Get Started!",
      icon: <Store className="w-5 h-5 text-amber-500" />,
      action: () => advanceTutorial(),
    },
    {
      title: 'Step 1: Stock Your Shelves 🍪',
      desc: 'Customers only buy what is in stock! Go to the Products tab or click the Snacks shelf on the game map to buy your first stock.',
      actionText: 'Open Products Tab',
      icon: <ShoppingBag className="w-5 h-5 text-emerald-500" />,
      action: () => {
        setActiveTab('products');
        advanceTutorial();
      },
    },
    {
      title: 'Step 2: Watch Customers Shop & Pay 🛒',
      desc: 'Cute customers will arrive at your door, pick products, and line up at the checkout counter. Click the register anytime to speed up scanning!',
      actionText: 'Got It!',
      icon: <Sparkles className="w-5 h-5 text-sky-500" />,
      action: () => advanceTutorial(),
    },
    {
      title: 'Step 3: Automate with Staff & Upgrades 🤖',
      desc: 'Hire Alex the Cashier to auto-scan, and Sam the Stocker to automatically buy low inventory so your shelves are never empty!',
      actionText: 'Start Playing!',
      icon: <Bot className="w-5 h-5 text-purple-500" />,
      action: () => advanceTutorial(),
    },
  ];

  const current = steps[tutorialStep] || steps[0];

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-amber-300 shadow-xl p-4 z-40 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            {current.icon}
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block">
              Quick Guide ({tutorialStep + 1}/4)
            </span>
            <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm leading-tight">
              {current.title}
            </h4>
          </div>
        </div>

        <button
          onClick={advanceTutorial}
          title="Dismiss tutorial"
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-600 leading-relaxed">{current.desc}</p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === tutorialStep ? 'w-5 bg-amber-500' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={current.action}
          className="py-1.5 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1 active:scale-95 transition-all"
        >
          <span>{current.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
