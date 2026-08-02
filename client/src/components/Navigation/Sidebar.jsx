import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  GraduationCap,
  Timer,
  BarChart3,
  RotateCcw,
  Trophy,
  Settings,
  Wand2,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const navItems = [
  { id: 'dashboard',     label: 'Dashboard',            icon: LayoutDashboard, color: '#7C3AED' },
  { id: 'schedule',      label: 'AI Schedule',           icon: Calendar,        color: '#A855F7' },
  { id: 'subjects',      label: 'Subjects & Syllabus',   icon: BookOpen,        color: '#3B82F6' },
  { id: 'exams',         label: 'Exams & Countdowns',    icon: GraduationCap,   color: '#F59E0B' },
  { id: 'pomodoro',      label: 'Pomodoro Focus',        icon: Timer,           color: '#F43F5E' },
  { id: 'analytics',     label: 'Analytics & Insights',  icon: BarChart3,       color: '#10B981' },
  { id: 'revision',      label: 'Spaced Revision',       icon: RotateCcw,       color: '#06B6D4' },
  { id: 'gamification',  label: 'Achievements & XP',     icon: Trophy,          color: '#F59E0B' },
  { id: 'settings',      label: 'Profile & Settings',    icon: Settings,        color: '#94A3B8' },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const { gamification } = useData();
  const xpProgress = Math.min(100, ((gamification?.xp || 0) % 200) / 2);
  const level = gamification?.level || 1;
  const xp = gamification?.xp || 0;

  return (
    <aside className="w-64 hidden md:flex flex-col justify-between min-h-screen sticky top-0 z-40
      bg-white/90 dark:bg-[#080C18]/95 backdrop-blur-2xl
      border-r border-slate-200/60 dark:border-white/[0.06]
      transition-colors duration-300">

      {/* Top section */}
      <div className="flex flex-col flex-1 overflow-y-auto">

        {/* Logo Brand */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-100/80 dark:border-white/[0.06]">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-primary-gradient flex items-center justify-center shadow-lg shadow-violet-500/30 text-white animate-pulse-glow">
              <Wand2 className="w-5 h-5" />
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-[15px] tracking-tight shimmer-text font-outfit leading-none">
              Study Wizard
            </h1>
            <span className="text-[9px] font-black tracking-widest text-violet-600 dark:text-violet-400 uppercase mt-1 block">
              Neural Academy AI
            </span>
          </div>
        </div>

        {/* Level / XP Progress Banner */}
        <div className="mx-3.5 mt-4 p-4 rounded-2xl border border-violet-200/50 dark:border-violet-800/30
          bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/30">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-primary-gradient flex items-center justify-center shadow-md shadow-violet-500/30">
                <Trophy className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-extrabold text-violet-700 dark:text-violet-300 font-outfit">
                Level {level}
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-grotesk">
              {xp} XP
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className="h-full xp-bar-fill rounded-full transition-all duration-700"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
            {200 - ((xp) % 200)} XP to Level {level + 1}
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-3 mt-2 space-y-0.5 flex-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative
                  ${isActive
                    ? 'nav-item-active'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200
                  ${isActive
                    ? 'bg-white/40 dark:bg-white/10 shadow-sm'
                    : 'bg-slate-100 dark:bg-white/[0.04] group-hover:bg-slate-200 dark:group-hover:bg-white/[0.08]'
                  }`}
                  style={isActive ? { boxShadow: `0 0 12px ${item.color}30` } : {}}
                >
                  <Icon
                    className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
                    style={{ color: isActive ? item.color : undefined }}
                  />
                </div>
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" style={{ color: item.color }} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100/80 dark:border-white/[0.06]">
        <div className="flex items-center gap-2 px-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 font-outfit">
            AI Engine Active
          </p>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5 px-2">
          Study Wizard v1.0 · Adaptive Spaced Engine
        </p>
      </div>
    </aside>
  );
}
