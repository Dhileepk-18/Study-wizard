import React from 'react';
import { Trophy, Flame, Award, Coins, Sparkles, Target, Zap, ShieldCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function GamificationCenter() {
  const { gamification } = useData();

  const allBadges = [
    {
      badgeId: 'first_session',
      title: 'First Focus Session',
      description: 'Completed your first study session',
      icon: Target,
      unlocked: true
    },
    {
      badgeId: 'streak_7',
      title: '7 Day Streak',
      description: 'Studied for 7 consecutive days',
      icon: Flame,
      unlocked: (gamification?.currentStreak || 1) >= 7
    },
    {
      badgeId: 'hours_100',
      title: '100 Hours Mastery',
      description: 'Accumulated 100 total study hours',
      icon: Zap,
      unlocked: false
    },
    {
      badgeId: 'complete_subject',
      title: 'Subject Mastery',
      description: 'Completed 100% of a subject syllabus',
      icon: ShieldCheck,
      unlocked: true
    },
    {
      badgeId: 'perfect_week',
      title: 'Perfect Week',
      description: 'Completed all study blocks for 7 days straight',
      icon: Award,
      unlocked: false
    }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-6 h-6 text-[#6C63FF]" />
          <span>Gamification & Achievement Center</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Earn XP points, level up, collect study coins, and unlock badges as you study!
        </p>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Level Banner Card */}
        <div className="bg-gradient-to-br from-[#6C63FF] to-[#4F8EF7] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
              Level Status
            </span>
            <Sparkles className="w-5 h-5 text-purple-200" />
          </div>

          <div className="mt-4">
            <h2 className="text-3xl font-extrabold font-outfit">Level {gamification?.level || 1}</h2>
            <p className="text-xs text-purple-100 mt-1">{gamification?.xp || 100} Total XP Earned</p>

            <div className="mt-4">
              <div className="flex justify-between text-[11px] font-bold mb-1">
                <span>Progress to Level {(gamification?.level || 1) + 1}</span>
                <span>{((gamification?.xp || 100) % 200)} / 200 XP</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (((gamification?.xp || 100) % 200) / 2))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Streak Stat */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Streak</span>
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>

          <div className="my-3">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white font-outfit">
              {gamification?.currentStreak || 1} Days
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Longest Streak: {gamification?.longestStreak || 1} Days</p>
          </div>

          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Complete today's Pomodoro to keep it burning!
          </p>
        </div>

        {/* Study Coins */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Study Coins</span>
            <Coins className="w-6 h-6 text-yellow-500" />
          </div>

          <div className="my-3 flex items-center gap-2">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white font-outfit">
              {gamification?.coins || 50}
            </h3>
            <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
              Coins
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Use coins to unlock customized themes!
          </p>
        </div>

      </div>

      {/* Unlockable Badges Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-outfit">
          Achievement Badges Grid
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                  badge.unlocked
                    ? 'bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800/40'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 grayscale opacity-60'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                  badge.unlocked ? 'bg-[#6C63FF] text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white font-outfit">{badge.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{badge.description}</p>
                  <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded ${
                    badge.unlocked ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {badge.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
