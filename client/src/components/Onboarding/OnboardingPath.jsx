import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Target,
  Plus,
  Layers,
  Wand2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import API from '../../services/api';
import confetti from 'canvas-confetti';

export default function OnboardingPath({ onComplete }) {
  const { refreshAll } = useData();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Academic Goals
  const [learningStyle, setLearningStyle] = useState('Visual');
  const [dailyHours, setDailyHours] = useState(4);
  const [preferredTime, setPreferredTime] = useState('Evening');

  // Step 2: First Subject
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [color, setColor] = useState('#6C63FF');
  const [unitTitle, setUnitTitle] = useState('Unit 1: Fundamentals');
  const [topicName, setTopicName] = useState('Core Concepts');

  // Step 3: First Exam
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [targetMarks, setTargetMarks] = useState(85);

  const steps = [
    { number: 1, title: 'Study Habits', icon: Clock, description: 'Set daily available study hours and preferred times' },
    { number: 2, title: 'First Subject', icon: BookOpen, description: 'Add your primary subject and initial syllabus topic' },
    { number: 3, title: 'Upcoming Exam', icon: GraduationCap, description: 'Set exam dates to activate priority urgency calculation' },
    { number: 4, title: 'Generate AI Plan', icon: Wand2, description: 'Compute initial adaptive study timetable' }
  ];

  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(4, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = async () => {
    try {
      setLoading(true);

      // 1. Update Profile
      await API.put('/auth/profile', {
        learningStyle,
        dailyAvailableHours: Number(dailyHours),
        preferredStudyTime: preferredTime
      });

      // 2. Create Subject
      if (subjectName.trim()) {
        const subRes = await API.post('/subjects', {
          name: subjectName,
          code: subjectCode || subjectName.slice(0, 3).toUpperCase() + '101',
          difficulty,
          color,
          priority: 8,
          units: [
            {
              title: unitTitle || 'Unit 1: Fundamentals',
              unitNumber: 1,
              topics: [
                { name: topicName || 'Core Concepts', estimatedMinutes: 45, difficulty, completed: false }
              ]
            }
          ]
        });

        // 3. Create Exam if entered
        if (examName.trim() && examDate) {
          await API.post('/exams', {
            subjectId: subRes.data._id,
            examName,
            examDate,
            examType: 'CAT',
            targetMarks: Number(targetMarks),
            maximumMarks: 100,
            importanceLevel: 'High'
          });
        }
      }

      // 4. Trigger Schedule Generation
      await API.get('/schedule');
      await refreshAll();

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Onboarding setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedSampleData = async () => {
    try {
      setLoading(true);
      await API.post('/schedule/seed');
      await refreshAll();
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Seed sample data error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in">
      
      {/* Top Welcome Title */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#4F8EF7] text-white flex items-center justify-center text-2xl shadow-xl shadow-purple-500/20">
          🧙‍♂️
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold font-outfit text-slate-900 dark:text-white">
          Welcome to Study Wizard!
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto">
          Let's set up your clean account in 4 quick steps to generate your personalized AI study schedule.
        </p>
      </div>

      {/* Visual Step Progress Path Bar */}
      <div className="mb-8 p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="flex items-center justify-between relative">
          
          {/* Connector Line behind steps */}
          <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-700 -z-0" />
          <div 
            className="absolute top-1/2 left-8 -translate-y-1/2 h-1 bg-[#6C63FF] transition-all duration-500 -z-0"
            style={{ width: `${((currentStep - 1) / 3) * 85}%` }}
          />

          {steps.map(step => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;
            const Icon = step.icon;

            return (
              <div key={step.number} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                  isCompleted ? 'bg-emerald-500 text-white shadow-md' :
                  isCurrent ? 'bg-[#6C63FF] text-white shadow-lg shadow-purple-500/30 scale-110' :
                  'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] font-bold mt-2 hidden sm:inline ${
                  isCurrent ? 'text-[#6C63FF] dark:text-purple-300' : 'text-slate-400'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Card Form Container */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700/60 shadow-xl space-y-6">
        
        {/* Step 1: Study Habits */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-700/60 pb-3">
              <span className="text-[10px] uppercase font-bold text-[#6C63FF] tracking-wider">Step 1 of 4</span>
              <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">
                Configure Study Habits & Goal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tell the AI engine how many hours you have available each day.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Learning Style</label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                >
                  <option value="Visual">Visual (Diagrams & Charts)</option>
                  <option value="Auditory">Auditory (Lectures & Audio)</option>
                  <option value="Reading">Reading / Writing Notes</option>
                  <option value="Practical">Practical / Coding Hands-on</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Daily Available Study Hours</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Preferred Study Window</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                >
                  <option value="Morning">Morning (07:00 AM - 12:00 PM)</option>
                  <option value="Afternoon">Afternoon (01:00 PM - 05:00 PM)</option>
                  <option value="Evening">Evening (04:00 PM - 09:00 PM)</option>
                  <option value="Night">Night (08:00 PM - 01:00 AM)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: First Subject */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-700/60 pb-3">
              <span className="text-[10px] uppercase font-bold text-[#6C63FF] tracking-wider">Step 2 of 4</span>
              <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">
                Add Your First Subject & Topic
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your course details to populate your syllabus.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures & Algorithms"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Subject Code</label>
                <input
                  type="text"
                  placeholder="e.g. CS301"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Initial Topic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Binary Search Trees & Graph Traversal"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: First Exam */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-700/60 pb-3">
              <span className="text-[10px] uppercase font-bold text-[#6C63FF] tracking-wider">Step 3 of 4</span>
              <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">
                Add an Upcoming Exam (Optional)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exam dates trigger automatic priority score boosting for urgent subjects.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Exam Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mid-Semester CAT Exam"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Marks</label>
                <input
                  type="number"
                  value={targetMarks}
                  onChange={(e) => setTargetMarks(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: AI Schedule Generation */}
        {currentStep === 4 && (
          <div className="space-y-4 text-center py-4 animate-in fade-in">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-[#6C63FF] flex items-center justify-center font-bold text-2xl shadow-lg animate-pulse-glow">
              <Wand2 className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">
              Ready to Compute AI Schedule!
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Click below to generate your initial study timetable using the formula:<br />
              <span className="font-semibold text-[#6C63FF]">40% Exam Urgency + 30% Difficulty + 20% Syllabus + 10% Past Performance</span>
            </p>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <div>
            {currentStep > 1 && (
              <button
                onClick={handlePrevStep}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-200 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep < 4 ? (
              <button
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-[#6C63FF] text-white text-xs font-bold rounded-xl hover:bg-[#5B52E0] transition shadow-lg shadow-purple-500/25 flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-[#6C63FF] to-[#4F8EF7] text-white text-xs font-bold rounded-xl hover:brightness-110 transition shadow-xl shadow-purple-500/30 flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>{loading ? 'Generating Schedule...' : 'Launch My AI Schedule'}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Alternative Demo Data Button */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSeedSampleData}
          disabled={loading}
          className="text-xs text-slate-500 hover:text-[#6C63FF] underline font-medium"
        >
          Or load sample course data into this account for instant demonstration
        </button>
      </div>

    </div>
  );
}
