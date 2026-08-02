import React, { useState } from 'react';
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
  Sparkles,
  Wand2,
  X,
  ChevronRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';

const mainTabs = [
  { id: 'dashboard',  label: 'Home',     icon: LayoutDashboard },
  { id: 'schedule',   label: 'Schedule', icon: Calendar },
  { id: 'subjects',   label: 'Subjects', icon: BookOpen },
  { id: 'exams',      label: 'Exams',    icon: GraduationCap },
  { id: 'pomodoro',   label: 'Focus',    icon: Timer },
];

const allTabs = [
  { id: 'dashboard',    label: 'Dashboard',                icon: LayoutDashboard, color: '#7C3AED' },
  { id: 'schedule',     label: 'AI Schedule Planner',      icon: Calendar,        color: '#A855F7' },
  { id: 'subjects',     label: 'Subjects & Syllabus',      icon: BookOpen,        color: '#3B82F6' },
  { id: 'exams',        label: 'Exams & Countdowns',       icon: GraduationCap,   color: '#F59E0B' },
  { id: 'pomodoro',     label: 'Pomodoro Focus',           icon: Timer,           color: '#F43F5E' },
  { id: 'analytics',    label: 'Analytics & Insights',     icon: BarChart3,       color: '#10B981' },
  { id: 'revision',     label: 'Spaced Revision',          icon: RotateCcw,       color: '#06B6D4' },
  { id: 'gamification', label: 'Achievements & XP',        icon: Trophy,          color: '#F59E0B' },
  { id: 'settings',     label: 'Profile & Settings',       icon: Settings,        color: '#94A3B8' },
];

export default function MobileNav({ activeTab, setActiveTab, onOpenChat }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { gamification } = useData();
  const secondaryTabs = ['analytics', 'revision', 'gamification', 'settings'];

  return (
    <>
      {/* Floating Pill Bottom Nav */}
      <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 mobile-nav-pill rounded-[28px] px-2 py-2 flex items-center gap-1">
        {mainTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`mobile-nav-${tab.id}`}
              onClick={() => { setActiveTab(tab.id); setDrawerOpen(false); }}
              className={`flex items-center transition-all duration-250 rounded-[20px]
                ${isActive
                  ? 'bg-primary-gradient text-white gap-2 px-4 py-2.5 shadow-lg shadow-violet-500/30'
                  : 'text-slate-500 dark:text-slate-400 p-2.5 hover:text-violet-500 dark:hover:text-violet-400'
                }`}
            >
              <Icon className={`flex-shrink-0 transition-all duration-200 ${isActive ? 'w-4 h-4' : 'w-5 h-5'}`} />
              {isActive && (
                <span className="text-[12px] font-bold whitespace-nowrap">{tab.label}</span>
              )}
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex items-center p-2.5 rounded-[20px] transition-all duration-200
            ${secondaryTabs.includes(activeTab)
              ? 'bg-primary-gradient text-white shadow-lg shadow-violet-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-violet-500'}`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Slide-up Sheet Drawer */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end justify-center animate-fade-in-up"
          onClick={e => { if (e.target === e.currentTarget) setDrawerOpen(false); }}
          style={{ background: 'rgba(7, 11, 20, 0.7)', backdropFilter: 'blur(6px)' }}
        >
          <div className="w-full max-w-lg mx-4 mb-6 rounded-3xl overflow-hidden shadow-2xl border border-white/[0.08]
            bg-white dark:bg-[#0D1424] animate-slide-up">

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-primary-gradient flex items-center justify-center shadow-md">
                  <Wand2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-outfit">Study Wizard</h3>
                  <p className="text-[10px] text-violet-500 font-bold">
                    Level {gamification?.level || 1} · {gamification?.xp || 0} XP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.07] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Chat Button */}
            <div className="px-4 pt-4">
              <button
                onClick={() => { setDrawerOpen(false); if (onOpenChat) onOpenChat(); }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 hover:brightness-110 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
                <span>Launch AI Assistant</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Grid */}
            <div className="p-4 grid grid-cols-2 gap-2">
              {allTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setDrawerOpen(false); }}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[13px] font-semibold transition-all duration-200
                      ${isActive
                        ? 'text-white shadow-md'
                        : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.07]'
                      }`}
                    style={isActive ? { backgroundColor: tab.color, boxShadow: `0 4px 16px ${tab.color}50` } : {}}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-left text-[12px]">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="px-5 pb-5 text-center">
              <p className="text-[10px] text-slate-400">Study Wizard AI · Neural Academy Engine</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
