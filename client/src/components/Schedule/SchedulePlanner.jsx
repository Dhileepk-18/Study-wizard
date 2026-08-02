import React, { useState } from 'react';
import { Calendar as CalendarIcon, RefreshCw, CheckCircle, Clock, Sparkles, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function SchedulePlanner({ onNavigate }) {
  const { schedulePlans, triggerAdaptiveReschedule, rescheduling, toggleTopicCompletion } = useData();
  const [viewMode, setViewMode] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  const currentPlan = schedulePlans[selectedDateIndex] || schedulePlans[0];
  const dateStr = currentPlan?.date || new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">

      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#6C63FF]" />
            <span>AI Adaptive Calendar & Schedule</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic timetable rebalanced automatically based on exam urgency & study progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle Buttons */}
          <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-xl transition ${viewMode === 'daily' ? 'bg-white dark:bg-slate-700 text-[#6C63FF] shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-xl transition ${viewMode === 'weekly' ? 'bg-white dark:bg-slate-700 text-[#6C63FF] shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Weekly
            </button>
          </div>

          <button
            onClick={triggerAdaptiveReschedule}
            disabled={rescheduling}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6C63FF] to-[#4F8EF7] text-white text-xs font-bold rounded-2xl shadow-lg hover:brightness-110 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rescheduling ? 'animate-spin' : ''}`} />
            <span>{rescheduling ? 'Recalculating...' : 'Regenerate Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Date Selector Strip */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
        <button
          onClick={() => setSelectedDateIndex(Math.max(0, selectedDateIndex - 1))}
          disabled={selectedDateIndex === 0}
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 overflow-x-auto py-1">
          {schedulePlans.map((plan, idx) => {
            const planDate = new Date(plan.date);
            const dayName = planDate.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = planDate.getDate();
            const isSelected = idx === selectedDateIndex;

            return (
              <button
                key={plan._id || idx}
                onClick={() => setSelectedDateIndex(idx)}
                className={`flex flex-col items-center min-w-[60px] px-3 py-2 rounded-2xl text-xs font-bold transition-all ${isSelected
                    ? 'bg-[#6C63FF] text-white shadow-lg shadow-purple-500/30 scale-105'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-purple-50'
                  }`}
              >
                <span className="text-[10px] uppercase font-semibold opacity-80">{dayName}</span>
                <span className="text-base font-outfit font-extrabold">{dayNum}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setSelectedDateIndex(Math.min(schedulePlans.length - 1, selectedDateIndex + 1))}
          disabled={selectedDateIndex >= schedulePlans.length - 1}
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Schedule Display */}
      {viewMode === 'daily' ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-outfit">
                Timetable for {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h2>
              <p className="text-xs text-slate-400">Total Study Time: {currentPlan?.totalMinutes || 0} Minutes</p>
            </div>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950 text-[#6C63FF] font-bold text-xs rounded-full">
              {currentPlan?.blocks?.length || 0} Sessions
            </span>
          </div>

          <div className="space-y-3">
            {(!currentPlan?.blocks || currentPlan.blocks.length === 0) ? (
              <p className="text-xs text-slate-400 text-center py-8">No study blocks for this day.</p>
            ) : (
              currentPlan.blocks.map((block, bIdx) => (
                <div
                  key={bIdx}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#6C63FF] transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-12 rounded-full"
                      style={{ backgroundColor: block.subjectColor || '#6C63FF' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {block.scheduledTime || '09:00 AM'} • {block.subjectName}
                        </span>
                        {block.isRevision && (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-full">
                            Spaced Revision
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {block.topicName} ({block.unitName || 'Unit 1'})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-mono text-slate-400">{block.durationMinutes} mins</span>
                    <button
                      onClick={() => toggleTopicCompletion(block.subjectId, block.unitId, block.topicId, block.status !== 'completed')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${block.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-[#6C63FF] text-white hover:bg-[#5B52E0]'
                        }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{block.status === 'completed' ? 'Completed' : 'Complete'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Weekly View Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedulePlans.map((plan, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-outfit border-b border-slate-100 dark:border-slate-700/60 pb-2 mb-3">
                {new Date(plan.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </h3>

              <div className="space-y-2">
                {plan.blocks && plan.blocks.slice(0, 3).map((b, bIdx) => (
                  <div key={bIdx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-700/40 text-xs flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.subjectColor || '#6C63FF' }} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{b.subjectName}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
