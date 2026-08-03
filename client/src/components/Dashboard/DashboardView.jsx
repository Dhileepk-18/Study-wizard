import React, { useState } from 'react';
import {
  CheckCircle, Clock, Flame, Calendar, Sparkles, ArrowRight,
  TrendingUp, Award, AlertCircle, Play, RotateCcw, BookOpen,
  Plus, Wand2, Zap, Target
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import API from '../../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import SpotlightCard from '../Common/SpotlightCard';

export default function DashboardView({ onNavigate }) {
  const {
    subjects = [], exams = [], schedulePlans = [], analytics,
    gamification, triggerAdaptiveReschedule, rescheduling,
    updateBlockStatus, toggleTopicCompletion, refreshAll
  } = useData();

  const [seeding, setSeeding] = useState(false);

  const handleSeedDemoData = async () => {
    try {
      setSeeding(true);
      await API.post('/schedule/seed');
      await refreshAll();
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setSeeding(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayPlan = schedulePlans.find(p => p.date === todayStr) || schedulePlans[0];
  const todayBlocks = todayPlan?.blocks || [];
  const completedBlocksCount = todayBlocks.filter(b => b.status === 'completed').length;
  const totalBlocksCount = todayBlocks.length;
  const progressPercent = totalBlocksCount > 0 ? Math.round((completedBlocksCount / totalBlocksCount) * 100) : 0;
  const upcomingExam = exams.length > 0 ? exams[0] : null;
  const daysToExam = upcomingExam
    ? Math.max(0, Math.ceil((new Date(upcomingExam.examDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;
  const hasNoSubjects = subjects.length === 0;

  const quotes = [
    '"Success is not final; failure is not fatal — it is the courage to continue." – Churchill',
    '"The secret of getting ahead is getting started." – Mark Twain',
    '"It always seems impossible until it\'s done." – Nelson Mandela',
    '"Small daily improvements over time lead to stunning results." – Robin Sharma',
  ];
  const todayQuote = quotes[new Date().getDay() % quotes.length];

  const statCards = [
    {
      label: 'Study Streak',
      value: `${gamification?.currentStreak || 0}`,
      unit: 'days',
      icon: Flame,
      iconBg: 'from-amber-500 to-orange-500',
      iconShadow: 'shadow-amber-500/30',
      glow: 'rgba(245, 158, 11, 0.2)',
      valueColor: 'text-amber-500',
    },
    {
      label: 'Hours Today',
      value: `${(completedBlocksCount * 0.75).toFixed(1)}`,
      unit: '/ 4.0 h',
      icon: Clock,
      iconBg: 'from-violet-600 to-purple-600',
      iconShadow: 'shadow-violet-500/30',
      glow: 'rgba(124, 58, 237, 0.2)',
      valueColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      label: 'Daily Progress',
      value: `${progressPercent}`,
      unit: '%',
      icon: TrendingUp,
      iconBg: 'from-emerald-500 to-teal-600',
      iconShadow: 'shadow-emerald-500/30',
      glow: 'rgba(16, 185, 129, 0.2)',
      valueColor: 'text-emerald-500',
    },
    {
      label: 'Level & XP',
      value: `Lv ${gamification?.level || 1}`,
      unit: `${gamification?.xp || 0} xp`,
      icon: Award,
      iconBg: 'from-purple-500 to-pink-600',
      iconShadow: 'shadow-purple-500/30',
      glow: 'rgba(168, 85, 247, 0.2)',
      valueColor: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6 pb-14 animate-fade-in-up">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl hero-mesh p-7 md:p-10 text-white shadow-2xl shadow-violet-500/20 border border-white/15">
        {/* Mesh background */}
        <div className="absolute inset-0 opacity-25 pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
        />
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none animate-float" />
        <div className="absolute right-32 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-[11px] font-bold border border-white/25 backdrop-blur-md mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              <span>AI Adaptive Engine · Online</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold font-outfit tracking-tight leading-tight">
              {hasNoSubjects ? "Let's get started 🚀" : `Welcome back 👋`}
            </h1>
            <p className="text-purple-100/85 text-sm md:text-base mt-2 max-w-lg font-medium leading-relaxed">
              {hasNoSubjects
                ? 'Your account is ready! Add subjects or load demo data to activate your AI schedule.'
                : `You have ${Math.max(0, totalBlocksCount - completedBlocksCount)} sessions left today. Keep pushing! 💪`}
            </p>
          </div>

          {!hasNoSubjects ? (
            <button onClick={triggerAdaptiveReschedule} disabled={rescheduling}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-violet-700 font-extrabold text-sm rounded-2xl shadow-xl
                hover:bg-violet-50 active:scale-95 transition-all self-start md:self-auto flex-shrink-0">
              <RotateCcw className={`w-4 h-4 ${rescheduling ? 'animate-spin' : ''}`} />
              <span>{rescheduling ? 'Recalculating...' : 'Regenerate AI Plan'}</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              <button onClick={handleSeedDemoData} disabled={seeding}
                className="flex items-center gap-2 px-5 py-3 bg-white/15 backdrop-blur-md border border-white/25 text-white font-bold text-sm rounded-2xl hover:bg-white/25 transition-all">
                <Wand2 className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
                <span>{seeding ? 'Seeding...' : '⚡ Load Demo Data'}</span>
              </button>
              <button onClick={() => onNavigate('subjects')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-violet-700 font-extrabold text-sm rounded-2xl shadow-xl hover:bg-violet-50 active:scale-95 transition-all">
                <Plus className="w-4 h-4" />
                <span>Add First Subject</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat Cards Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <SpotlightCard key={card.label} glowColor={card.glow}
              className={`p-5 card-hover animate-fade-in-up`}
              style={{ animationDelay: `${i * 70}ms` }}>
              <div className="flex flex-col gap-3">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${card.iconBg} text-white flex items-center justify-center shadow-lg ${card.iconShadow}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className={`text-2xl font-black stat-number ${card.valueColor}`}>{card.value}</span>
                    <span className="text-[11px] font-semibold text-slate-400">{card.unit}</span>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      {/* ── Main 2-col Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left 2-col: Schedule + Chart */}
        <div className="lg:col-span-2 space-y-5">

          {/* Today's Schedule */}
          <SpotlightCard className="p-6 space-y-4" glowColor="rgba(124, 58, 237, 0.15)">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-outfit flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-500" />
                  Today's AI Schedule
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Priority: Exam urgency 40% · Difficulty 30% · Spaced revision</p>
              </div>
              <button onClick={() => onNavigate('schedule')}
                className="text-[12px] font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1
                  bg-violet-50 dark:bg-violet-950/50 px-3 py-1.5 rounded-xl border border-violet-200/50 dark:border-violet-800/40 hover:bg-violet-100 dark:hover:bg-violet-950/80 transition-colors">
                <span>Full Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress bar */}
            {totalBlocksCount > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>{completedBlocksCount} of {totalBlocksCount} sessions complete</span>
                  <span className="text-violet-500 font-bold">{progressPercent}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full xp-bar-fill rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}

            {/* Schedule list */}
            <div className="space-y-3">
              {hasNoSubjects ? (
                <div className="py-10 text-center border-2 border-dashed border-violet-200/60 dark:border-violet-900/40 rounded-2xl space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-500 flex items-center justify-center">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-outfit">No Courses Yet</h3>
                    <p className="text-[12px] text-slate-400 max-w-sm mx-auto mt-1">
                      Add subjects or load demo data to generate your AI timetable.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button onClick={handleSeedDemoData} disabled={seeding}
                      className="px-4 py-2 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-[12px] font-bold rounded-xl hover:bg-violet-50 transition-colors">
                      {seeding ? 'Seeding...' : '⚡ Load Demo Data'}
                    </button>
                    <button onClick={() => onNavigate('subjects')}
                      className="px-4 py-2 btn-primary text-[12px] rounded-xl shadow-md">
                      + Add Subject
                    </button>
                  </div>
                </div>
              ) : todayBlocks.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-sm text-slate-400">No blocks scheduled for today.</p>
                  <button onClick={triggerAdaptiveReschedule}
                    className="mt-3 px-5 py-2.5 btn-primary text-[12px] rounded-xl shadow-md">
                    Generate Schedule
                  </button>
                </div>
              ) : (
                todayBlocks.map((block, idx) => {
                  const isDone = block.status === 'completed';
                  return (
                    <div key={idx}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-200 glowing-border
                        ${isDone
                          ? 'bg-slate-50/60 dark:bg-white/[0.02] border-slate-200/50 dark:border-white/[0.04] opacity-60'
                          : 'bg-white/80 dark:bg-white/[0.04] border-slate-200/80 dark:border-white/[0.07]'}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-1 h-12 rounded-full flex-shrink-0"
                          style={{ backgroundColor: block.subjectColor || '#7C3AED' }} />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-extrabold text-slate-900 dark:text-white font-outfit">{block.subjectName}</span>
                            {block.isRevision && (
                              <span className="px-2 py-0.5 text-[9px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200/60 dark:border-amber-800/50 uppercase tracking-wide">
                                Spaced Revision
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {block.topicName} · <span className="font-bold text-slate-600 dark:text-slate-300">{block.durationMinutes} min</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!isDone && (
                          <button onClick={() => onNavigate('pomodoro')}
                            className="p-2 bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-950 transition-colors"
                            title="Start Pomodoro">
                            <Play className="w-3.5 h-3.5 fill-violet-600 dark:fill-violet-300" />
                          </button>
                        )}
                        <button
                          onClick={() => updateBlockStatus(todayPlan?._id, block._id, isDone ? 'pending' : 'completed', block.subjectId, block.unitId, block.topicId)}
                          className={`px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all
                            ${isDone
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50'
                              : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-white border border-slate-200 dark:border-white/[0.07]'}`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isDone ? 'Done' : 'Mark Done'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SpotlightCard>

          {/* Weekly Chart */}
          <SpotlightCard className="p-6 space-y-3" glowColor="rgba(168, 85, 247, 0.15)">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-500" />
              Weekly Focus Productivity
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.last7DaysTrend || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1424', borderColor: 'rgba(124,58,237,0.3)',
                      borderRadius: '14px', color: '#fff', fontSize: '12px',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.5)'
                    }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#7C3AED" strokeWidth={3}
                    fillOpacity={1} fill="url(#violetGrad)" dot={{ fill: '#7C3AED', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#A855F7', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SpotlightCard>
        </div>

        {/* Right 1-col: Exam + Quote */}
        <div className="space-y-5">

          {/* Exam Countdown */}
          <div className="rounded-3xl p-6 text-white relative overflow-hidden border border-indigo-500/25"
            style={{ background: 'linear-gradient(145deg, #0D1B3E 0%, #0F172A 50%, #0D1424 100%)' }}>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-indigo-600/15 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-300 bg-rose-950/70 px-3 py-1.5 rounded-full border border-rose-800/50">
                  Exam Countdown
                </span>
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </div>

              {upcomingExam ? (
                <>
                  <h3 className="text-xl font-black text-white font-outfit leading-tight">{upcomingExam.examName}</h3>
                  <p className="text-[12px] text-violet-300 font-bold mt-1">{upcomingExam.subjectName}</p>

                  <div className="my-5 grid grid-cols-2 gap-3">
                    <div className="p-4 bg-white/[0.07] rounded-2xl border border-white/[0.09] text-center">
                      <span className="text-4xl font-black text-white stat-number block">{daysToExam}</span>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Days Left</p>
                    </div>
                    <div className="p-4 bg-white/[0.07] rounded-2xl border border-white/[0.09] text-center">
                      <span className="text-2xl font-black text-violet-300 stat-number block">{upcomingExam.targetMarks}</span>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Target</p>
                    </div>
                  </div>

                  <button onClick={() => onNavigate('exams')}
                    className="w-full py-3 btn-primary rounded-2xl text-[13px] shadow-lg shadow-violet-500/30">
                    View Exam Schedule
                  </button>
                </>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-[12px] text-slate-400">No upcoming exams yet.</p>
                  <button onClick={() => onNavigate('exams')}
                    className="mt-3 text-[12px] text-violet-400 font-bold hover:underline">
                    + Add Upcoming Exam
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Daily Quote */}
          <SpotlightCard className="p-5 space-y-3" glowColor="rgba(244, 63, 94, 0.15)">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span className="text-[11px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider">Daily Motivation</span>
            </div>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed">
              {todayQuote}
            </p>
          </SpotlightCard>

        </div>
      </div>
    </div>
  );
}
