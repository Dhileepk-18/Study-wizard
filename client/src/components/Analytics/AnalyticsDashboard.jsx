import React from 'react';
import { BarChart3, TrendingUp, PieChart as PieIcon, Award, Sparkles, AlertCircle, CheckCircle, Clock, Target } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';
import SpotlightCard from '../Common/SpotlightCard';

const COLORS = ['#7C3AED', '#A855F7', '#F43F5E', '#10B981', '#F59E0B', '#3B82F6', '#06B6D4'];

export default function AnalyticsDashboard() {
  const { analytics, subjects } = useData();

  const subjectData = analytics?.subjectBreakdown?.map((item, i) => ({
    name: item.name,
    value: item.minutes || 30,
    color: item.color || COLORS[i % COLORS.length],
  })) || [
    { name: 'Data Structures', value: 120, color: '#7C3AED' },
    { name: 'Database Systems', value: 90,  color: '#A855F7' },
    { name: 'Operating Systems', value: 60,  color: '#F43F5E' },
  ];

  const syllabusData = subjects.map(sub => {
    let total = 0, done = 0;
    if (sub.units) {
      sub.units.forEach(u => {
        if (u.topics) { total += u.topics.length; done += u.topics.filter(t => t.completed).length; }
      });
    }
    return { name: sub.code || sub.name.slice(0, 5), fullName: sub.name, Completed: done, Remaining: total - done };
  });

  const metricCards = [
    { label: 'Total Study Time', value: `${analytics?.totalHours || '0'}`, unit: 'hours', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40', border: 'border-violet-200/60 dark:border-violet-800/40', icon: Clock },
    { label: 'Daily Average',    value: `${analytics?.avgDailyHours || '0'}`, unit: 'hrs/day', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-200/60 dark:border-blue-800/40', icon: TrendingUp },
    { label: 'Most Studied',     value: analytics?.mostStudied || 'N/A', unit: '', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200/60 dark:border-amber-800/40', icon: Award, small: true },
    { label: 'Syllabus Done',    value: `${analytics?.completionPercentage || 0}`, unit: '%', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200/60 dark:border-emerald-800/40', icon: Target },
  ];

  const tooltipStyle = {
    backgroundColor: '#0D1424',
    border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: '14px',
    color: '#fff',
    fontSize: '12px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold font-outfit text-slate-900 dark:text-white flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-violet-500" />
          Analytics & Performance Insights
        </h1>
        <p className="text-[13px] text-slate-400 mt-1">
          Study distribution, weak/strong areas, and personalized AI recommendations.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <SpotlightCard key={card.label}
              glowColor={`rgba(124,58,237,0.12)`}
              className={`p-5 card-hover animate-fade-in-up border ${card.border}`}
              style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`w-9 h-9 rounded-2xl ${card.bg} flex items-center justify-center mb-3 border ${card.border}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">{card.label}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`stat-number font-black ${card.small ? 'text-base' : 'text-2xl'} ${card.color}`}>{card.value}</span>
                {card.unit && <span className="text-[11px] text-slate-400 font-semibold">{card.unit}</span>}
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Donut Pie */}
        <SpotlightCard className="p-6" glowColor="rgba(124,58,237,0.15)">
          <h3 className="text-[14px] font-extrabold text-slate-900 dark:text-white font-outfit flex items-center gap-2 mb-5">
            <PieIcon className="w-4 h-4 text-violet-500" />
            Study Hours by Subject
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subjectData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={4} dataKey="value" strokeWidth={0}>
                  {subjectData.map((entry, i) => (
                    <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend formatter={val => <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        {/* Stacked Bar */}
        <SpotlightCard className="p-6" glowColor="rgba(16,185,129,0.12)">
          <h3 className="text-[14px] font-extrabold text-slate-900 dark:text-white font-outfit flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            Topics Completed vs Remaining
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={syllabusData} margin={{ left: -20 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Completed" fill="#7C3AED" radius={[6,6,0,0]} maxBarSize={32} />
                <Bar dataKey="Remaining" fill="rgba(148,163,184,0.3)" radius={[6,6,0,0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      </div>

      {/* 7-day Trend */}
      <SpotlightCard className="p-6" glowColor="rgba(168,85,247,0.12)">
        <h3 className="text-[14px] font-extrabold text-slate-900 dark:text-white font-outfit flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-purple-500" />
          7-Day Focus Hours Trend
        </h3>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.last7DaysTrend || []} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="hours" stroke="#7C3AED" strokeWidth={3}
                fillOpacity={1} fill="url(#analyticsGrad)"
                dot={{ fill: '#7C3AED', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#A855F7', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SpotlightCard>

      {/* Weak / Strong / AI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Weak Areas */}
        <SpotlightCard className="p-5" glowColor="rgba(244,63,94,0.12)">
          <h4 className="text-[12px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <AlertCircle className="w-4 h-4" />
            Weak Areas
          </h4>
          <div className="space-y-2.5">
            {!analytics?.weakAreas?.length ? (
              <p className="text-[12px] text-slate-400 py-3 text-center">All subjects are balanced!</p>
            ) : analytics.weakAreas.map((item, i) => (
              <div key={i} className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200/60 dark:border-rose-900/50">
                <p className="text-[12px] font-bold text-rose-800 dark:text-rose-300">{item.subject}</p>
                <p className="text-[11px] text-rose-600/70 dark:text-rose-400/70 mt-0.5">{item.reason}</p>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* Strong Areas */}
        <SpotlightCard className="p-5" glowColor="rgba(16,185,129,0.12)">
          <h4 className="text-[12px] font-black text-emerald-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <CheckCircle className="w-4 h-4" />
            Strong Performance
          </h4>
          <div className="space-y-2.5">
            {!analytics?.strongAreas?.length ? (
              <p className="text-[12px] text-slate-400 py-3 text-center">Keep studying to build strengths!</p>
            ) : analytics.strongAreas.map((item, i) => (
              <div key={i} className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/50">
                <p className="text-[12px] font-bold text-emerald-800 dark:text-emerald-300">{item.subject}</p>
                <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">{item.reason}</p>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* AI Recommendations */}
        <div className="rounded-3xl p-5 border border-violet-800/30 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #13062E 0%, #0F0B2A 50%, #0D1020 100%)' }}>
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-purple-600/15 rounded-full blur-xl pointer-events-none" />

          <h4 className="text-[12px] font-black text-violet-300 uppercase tracking-wider flex items-center gap-1.5 mb-3 relative z-10">
            <Sparkles className="w-4 h-4 text-violet-400 animate-spin-slow" />
            AI Coach Recommendations
          </h4>
          <div className="space-y-2.5 relative z-10">
            {analytics?.recommendations?.map((rec, i) => (
              <div key={i} className="p-3 bg-white/[0.06] backdrop-blur-sm rounded-2xl border border-white/[0.08] flex gap-2.5">
                <div className="w-5 h-5 rounded-full bg-violet-600/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[10px] font-black text-violet-300">{i + 1}</span>
                </div>
                <p className="text-[12px] text-purple-100/80 font-medium leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
