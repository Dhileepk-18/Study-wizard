import React, { useState } from 'react';
import { Plus, RefreshCw, Timer, Sparkles, X, BookOpen } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function QuickActionFAB({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const { triggerAdaptiveReschedule, rescheduling } = useData();

  const actions = [
    {
      label: 'Regenerate AI Schedule',
      icon: RefreshCw,
      spinning: rescheduling,
      color: 'from-violet-600 to-purple-600',
      shadow: 'shadow-violet-500/30',
      onClick: () => { triggerAdaptiveReschedule(); setOpen(false); }
    },
    {
      label: 'Start Pomodoro Focus',
      icon: Timer,
      color: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/30',
      onClick: () => { onNavigate('pomodoro'); setOpen(false); }
    },
    {
      label: 'Add Subject',
      icon: BookOpen,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/30',
      onClick: () => { onNavigate('subjects'); setOpen(false); }
    },
  ];

  return (
    <div className="fixed bottom-24 md:bottom-6 right-5 z-40 flex flex-col items-end gap-3">

      {/* Sub-actions (staggered) */}
      {open && (
        <div className="flex flex-col items-end gap-2.5 mb-1">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                disabled={action.spinning}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r ${action.color} text-white text-[12px] font-bold shadow-xl ${action.shadow}
                  hover:brightness-110 hover:-translate-x-0.5 active:scale-95 transition-all duration-200 animate-slide-up backdrop-blur-sm`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Icon className={`w-3.5 h-3.5 ${action.spinning ? 'animate-spin' : ''}`} />
                <span>{action.spinning ? 'Processing...' : action.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        id="quick-action-fab"
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full bg-primary-gradient text-white flex items-center justify-center
          shadow-2xl shadow-violet-500/40 transition-all duration-300
          hover:scale-105 active:scale-95 animate-pulse-glow
          ${open ? 'rotate-[135deg]' : 'rotate-0'}`}
        title="Quick Actions"
      >
        {open ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>
    </div>
  );
}
