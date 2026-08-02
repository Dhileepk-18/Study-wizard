import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import API from '../../services/api';

export default function SubjectManager() {
  const { subjects, refreshAll, toggleTopicCompletion } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [targetSubjectId, setTargetSubjectId] = useState(null);

  const [expandedSubject, setExpandedSubject] = useState(null);

  // Form State for new subject
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState(4);
  const [difficulty, setDifficulty] = useState('Medium');
  const [color, setColor] = useState('#6366F1');
  const [priority, setPriority] = useState(7);
  const [professorName, setProfessorName] = useState('');

  // Form State for new unit/topic
  const [unitTitle, setUnitTitle] = useState('');
  const [topicName, setTopicName] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/subjects', {
        name,
        code,
        credits: Number(credits),
        difficulty,
        color,
        priority: Number(priority),
        professorName,
        units: [] // 100% clean - zero default units/topics
      });
      setShowAddModal(false);
      setName('');
      setCode('');
      setProfessorName('');
      await refreshAll();
    } catch (err) {
      console.error('Create subject error:', err);
    }
  };

  const handleAddUnitTopic = async (e) => {
    e.preventDefault();
    if (!targetSubjectId || !unitTitle || !topicName) return;

    try {
      const subject = subjects.find(s => s._id === targetSubjectId);
      if (!subject) return;

      const existingUnits = [...(subject.units || [])];
      let targetUnit = existingUnits.find(u => u.title.toLowerCase() === unitTitle.toLowerCase());

      if (!targetUnit) {
        targetUnit = {
          title: unitTitle,
          unitNumber: existingUnits.length + 1,
          topics: []
        };
        existingUnits.push(targetUnit);
      }

      targetUnit.topics.push({
        name: topicName,
        estimatedMinutes: Number(estimatedMinutes),
        difficulty: subject.difficulty || 'Medium',
        completed: false
      });

      await API.put(`/subjects/${targetSubjectId}`, { units: existingUnits });
      setShowUnitModal(false);
      setUnitTitle('');
      setTopicName('');
      await refreshAll();
    } catch (err) {
      console.error('Add unit error:', err);
    }
  };

  const handleDeleteSubject = async (id) => {
    try {
      await API.delete(`/subjects/${id}`);
      await refreshAll();
    } catch (err) {
      console.error('Delete subject error:', err);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-slate-900 dark:text-white flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] text-white shadow-lg shadow-indigo-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <span>Subject & Syllabus Manager</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Organize course units, topics, credit hours, difficulty ratings, and syllabus completion.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 btn-premium-gradient text-white text-xs font-extrabold rounded-2xl shadow-xl"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map(subject => {
          let totalTopics = 0;
          let completedTopics = 0;
          
          if (subject.units) {
            subject.units.forEach(u => {
              if (u.topics) {
                totalTopics += u.topics.length;
                completedTopics += u.topics.filter(t => t.completed).length;
              }
            });
          }
          const completionPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
          const isExpanded = expandedSubject === subject._id;

          return (
            <div
              key={subject._id}
              className="premium-glass-card glowing-border rounded-3xl p-6 md:p-7 space-y-5"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg text-sm"
                    style={{ backgroundColor: subject.color || '#6366F1' }}
                  >
                    {subject.code ? subject.code.slice(0, 2) : 'SB'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg font-outfit">{subject.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{subject.code} • {subject.credits} Credit Hours</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSubject(subject._id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                  title="Delete Subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Subject Badges */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                  subject.difficulty === 'Hard' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-900/60' :
                  subject.difficulty === 'Medium' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-900/60' :
                  'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60'
                }`}>
                  {subject.difficulty} Difficulty
                </span>

                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-[#6366F1] dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-indigo-500 text-indigo-500" /> Priority: {subject.priority || 5}/10
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600 dark:text-slate-300">Syllabus Completion</span>
                  <span className="text-[#6366F1] dark:text-indigo-400 font-outfit font-extrabold">{completionPct}% ({completedTopics}/{totalTopics})</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${completionPct}%`,
                      backgroundColor: subject.color || '#6366F1'
                    }}
                  />
                </div>
              </div>

              {/* Syllabus Toggle & Add Unit Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => setExpandedSubject(isExpanded ? null : subject._id)}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#6366F1] dark:hover:text-indigo-400 flex items-center gap-1 transition"
                >
                  <span>{isExpanded ? 'Hide Syllabus' : 'View Syllabus Topics'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => {
                    setTargetSubjectId(subject._id);
                    setShowUnitModal(true);
                  }}
                  className="text-xs font-extrabold text-[#6366F1] dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Unit/Topic</span>
                </button>
              </div>

              {/* Expanded Syllabus Details */}
              {isExpanded && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-4 animate-in fade-in">
                  {(!subject.units || subject.units.length === 0) ? (
                    <div className="p-5 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                      <p className="text-xs text-slate-400 font-medium">No syllabus units added yet.</p>
                      <button
                        onClick={() => {
                          setTargetSubjectId(subject._id);
                          setShowUnitModal(true);
                        }}
                        className="text-xs text-[#6366F1] dark:text-indigo-400 font-bold hover:underline"
                      >
                        + Add Custom Unit & Topic
                      </button>
                    </div>
                  ) : (
                    subject.units.map((unit, uIdx) => (
                      <div key={uIdx} className="bg-slate-50/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 space-y-2.5">
                        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2 font-outfit">
                          <Layers className="w-4 h-4 text-[#6366F1]" />
                          <span>{unit.title}</span>
                        </h4>

                        <div className="space-y-2">
                          {unit.topics && unit.topics.map((topic, tIdx) => (
                            <div
                              key={tIdx}
                              onClick={() => toggleTopicCompletion(subject._id, unit._id, topic._id, !topic.completed)}
                              className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs cursor-pointer hover:border-[#6366F1] transition shadow-sm"
                            >
                              <div className="flex items-center gap-2.5">
                                <CheckCircle2 className={`w-4 h-4 ${topic.completed ? 'text-emerald-500 fill-emerald-100 dark:fill-emerald-950' : 'text-slate-300 dark:text-slate-600'}`} />
                                <span className={topic.completed ? 'line-through text-slate-400' : 'font-semibold text-slate-800 dark:text-slate-200'}>
                                  {topic.name}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg">
                                {topic.estimatedMinutes || 45} mins
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Add Subject Glass Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-extrabold font-outfit text-slate-900 dark:text-white">Add New Subject</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS401"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">Color Tag</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">Professor Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Robert Vance"
                  value={professorName}
                  onChange={(e) => setProfessorName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-slate-900 dark:text-white font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 btn-premium-gradient text-white font-extrabold rounded-2xl shadow-xl mt-2"
              >
                Save Subject
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Unit / Topic Glass Modal */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-extrabold font-outfit text-slate-900 dark:text-white">Add Unit & Topic</h3>
              <button onClick={() => setShowUnitModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUnitTopic} className="space-y-4 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">Unit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 1: Fundamentals or Chapter 1"
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">Topic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction & Key Concepts"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 dark:text-slate-300 block mb-1.5">Estimated Study Minutes</label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#6366F1] outline-none text-slate-900 dark:text-white font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 btn-premium-gradient text-white font-extrabold rounded-2xl shadow-xl mt-2"
              >
                Add Topic to Subject
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

