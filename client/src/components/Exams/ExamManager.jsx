import React, { useState } from 'react';
import { GraduationCap, Plus, Trash2, Clock, AlertTriangle, Target, Calendar, X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import API from '../../services/api';

export default function ExamManager() {
  const { exams, subjects, refreshAll } = useData();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [subjectId, setSubjectId] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('10:00 AM');
  const [examType, setExamType] = useState('CAT');
  const [maximumMarks, setMaximumMarks] = useState(100);
  const [targetMarks, setTargetMarks] = useState(85);
  const [importanceLevel, setImportanceLevel] = useState('High');

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await API.post('/exams', {
        subjectId: subjectId || (subjects[0] ? subjects[0]._id : null),
        examName,
        examDate,
        examTime,
        examType,
        maximumMarks: Number(maximumMarks),
        targetMarks: Number(targetMarks),
        importanceLevel
      });
      setShowAddModal(false);
      setExamName('');
      setExamDate('');
      await refreshAll();
    } catch (err) {
      console.error('Create exam error:', err);
    }
  };

  const handleDeleteExam = async (id) => {
    try {
      await API.delete(`/exams/${id}`);
      await refreshAll();
    } catch (err) {
      console.error('Delete exam error:', err);
    }
  };

  const calculateDaysLeft = (targetDateStr) => {
    const target = new Date(targetDateStr);
    const now = new Date();
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#6C63FF]" />
            <span>Exam & Assessment Manager</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track CAT/FAT exams, quizzes, assignments, countdowns, and target marks.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6C63FF] text-white text-xs font-bold rounded-2xl shadow-lg hover:bg-[#5B52E0] transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Exam</span>
        </button>
      </div>

      {/* Exam Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map(exam => {
          const daysLeft = calculateDaysLeft(exam.examDate);
          const isUrgent = daysLeft <= 5;

          return (
            <div
              key={exam._id}
              className={`bg-white dark:bg-slate-800 rounded-3xl p-6 border shadow-sm transition-all hover:shadow-md relative ${isUrgent ? 'border-rose-400/60 dark:border-rose-800/60' : 'border-slate-200 dark:border-slate-700/60'
                }`}
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${exam.importanceLevel === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                    exam.importanceLevel === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                  {exam.importanceLevel} Importance
                </span>

                <button
                  onClick={() => handleDeleteExam(exam._id)}
                  className="text-slate-400 hover:text-rose-500 transition p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg font-outfit">{exam.examName}</h3>
                <p className="text-xs text-[#6C63FF] font-semibold mt-0.5">{exam.subjectName}</p>
              </div>

              {/* Countdown Banner */}
              <div className={`mt-4 p-4 rounded-2xl flex items-center justify-between ${isUrgent ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200' : 'bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200'
                }`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${isUrgent ? 'text-rose-500 animate-bounce' : 'text-[#6C63FF]'}`} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Countdown</p>
                    <p className="text-lg font-extrabold font-outfit">{daysLeft} Days Left</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-semibold">
                  {new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Target & Max Marks Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span>Target: <strong className="text-slate-900 dark:text-white">{exam.targetMarks}</strong> / {exam.maximumMarks}</span>
                </div>

                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 font-bold text-[10px] rounded">
                  Type: {exam.examType}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white">Add Exam / Assessment</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                >
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Exam Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Semester CAT 1"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                  >
                    <option value="CAT">CAT</option>
                    <option value="FAT">FAT</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Marks</label>
                  <input
                    type="number"
                    value={targetMarks}
                    onChange={(e) => setTargetMarks(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={maximumMarks}
                    onChange={(e) => setMaximumMarks(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Importance Level</label>
                <select
                  value={importanceLevel}
                  onChange={(e) => setImportanceLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#6C63FF] text-white font-bold rounded-xl hover:bg-[#5B52E0] transition"
              >
                Save Exam
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
