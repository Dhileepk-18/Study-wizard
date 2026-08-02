import React from 'react';
import { RotateCcw, CheckCircle, Clock } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function RevisionPlanner() {
  const { subjects, toggleTopicCompletion } = useData();

  // Collect all completed topics for spaced revision
  const revisionItems = [];
  subjects.forEach(subject => {
    if (subject.units) {
      subject.units.forEach(unit => {
        if (unit.topics) {
          unit.topics.forEach(topic => {
            if (topic.completed) {
              revisionItems.push({
                subjectId: subject._id,
                unitId: unit._id,
                topicId: topic._id,
                subjectName: subject.name,
                subjectColor: subject.color || '#7C3AED',
                topicName: topic.name,
                unitTitle: unit.title,
                revisionCount: topic.revisionCount || 1,
                lastRevisedAt: topic.lastRevisedAt,
                nextRevisionAt: topic.nextRevisionAt || new Date(Date.now() + 24 * 60 * 60 * 1000)
              });
            }
          });
        }
      });
    }
  });

  const getStageLabel = (count) => {
    switch (count) {
      case 1: return { label: 'Stage 1 · +1 Day',   color: 'bg-violet-600 text-white' };
      case 2: return { label: 'Stage 2 · +3 Days',  color: 'bg-blue-600 text-white' };
      case 3: return { label: 'Stage 3 · +7 Days',  color: 'bg-amber-500 text-white' };
      default: return { label: 'Stage 4 · +15 Days', color: 'bg-emerald-600 text-white' };
    }
  };

  const stageCards = [
    { stage: 'Stage 1', interval: '+1 Day',   desc: 'Short-term recall',   color: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900/40', label: 'text-violet-600' },
    { stage: 'Stage 2', interval: '+3 Days',  desc: 'Reinforcement',       color: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40',         label: 'text-blue-600' },
    { stage: 'Stage 3', interval: '+7 Days',  desc: 'Consolidation',       color: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40',     label: 'text-amber-500' },
    { stage: 'Stage 4', interval: '+15 Days', desc: 'Long-term mastery',   color: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40', label: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold font-outfit text-slate-900 dark:text-white flex items-center gap-2.5">
          <RotateCcw className="w-6 h-6 text-violet-500" />
          Spaced Repetition Revision
        </h1>
        <p className="text-[13px] text-slate-400 mt-1">
          Boost long-term retention using scientifically-proven spaced intervals.
        </p>
      </div>

      {/* Stage Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stageCards.map(s => (
          <div key={s.stage} className={`p-4 rounded-3xl border ${s.color} text-center`}>
            <span className={`text-[11px] font-black uppercase tracking-wider block ${s.label}`}>{s.stage}</span>
            <p className="text-lg font-bold text-slate-900 dark:text-white font-outfit mt-1">{s.interval}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Revision Task List */}
      <div className="bg-white dark:bg-[#0C1222] rounded-3xl p-6 border border-slate-200/60 dark:border-white/[0.07] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-outfit flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-500" />
            Topics Scheduled for Review
          </h2>
          <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-800/50">
            {revisionItems.length} topics
          </span>
        </div>

        {revisionItems.length === 0 ? (
          <div className="py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-500 flex items-center justify-center mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">No revision items yet</p>
            <p className="text-[12px] text-slate-400 mt-1 max-w-sm mx-auto">
              Mark syllabus topics as complete to automatically schedule them for spaced repetition.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {revisionItems.map((item, idx) => {
              const stage = getStageLabel(item.revisionCount);
              const nextDateStr = item.nextRevisionAt
                ? new Date(item.nextRevisionAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'Tomorrow';
              return (
                <div key={idx}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/[0.07] flex items-center justify-between gap-4
                    hover:border-violet-400/50 dark:hover:border-violet-600/50 transition-all duration-200 glowing-border bg-white/80 dark:bg-white/[0.03]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: item.subjectColor }} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-extrabold text-slate-900 dark:text-white font-outfit">{item.subjectName}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-full ${stage.color}`}>{stage.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.topicName} · {item.unitTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] text-slate-400 font-medium hidden sm:block">Due: {nextDateStr}</span>
                    <button
                      onClick={() => toggleTopicCompletion(item.subjectId, item.unitId, item.topicId, true)}
                      className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-violet-500/25"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Reviewed</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
