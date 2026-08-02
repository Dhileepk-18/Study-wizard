import React, { useState, useEffect } from 'react';
import { Settings, User, Download, Save, Moon, Sun, CheckCircle, FileText } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import API from '../../services/api';
import jsPDF from 'jspdf';

export default function ProfileSettingsView() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const { subjects, exams, analytics } = useData();

  const [college, setCollege] = useState('National Institute of Technology');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('6th Semester');
  const [year, setYear] = useState('3rd Year');
  const [learningStyle, setLearningStyle] = useState('Visual');
  const [dailyHours, setDailyHours] = useState(4);
  const [preferredTime, setPreferredTime] = useState('Evening');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await API.put('/auth/profile', {
        college,
        department,
        semester,
        year,
        learningStyle,
        dailyAvailableHours: Number(dailyHours),
        preferredStudyTime: preferredTime
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Save profile error:', err);
    }
  };

  const handleDownloadCSV = () => {
    window.open('/api/export/csv', '_blank');
  };

  const handleGeneratePDFReport = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(108, 99, 255);
    doc.text('Study Wizard - Academic Performance Report', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Student: ${user?.fullName || 'Student'} (${user?.email})`, 14, 30);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 14, 35);

    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(14, 40, 196, 40);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Academic Summary', 14, 50);

    doc.setFontSize(10);
    doc.text(`• Total Active Subjects: ${subjects.length}`, 14, 60);
    doc.text(`• Total Active Exams: ${exams.length}`, 14, 67);
    doc.text(`• Total Study Hours Logged: ${analytics?.totalHours || '4.5'} hrs`, 14, 74);
    doc.text(`• Syllabus Completion Rate: ${analytics?.completionPercentage || 40}%`, 14, 81);

    doc.setFontSize(12);
    doc.text('Enrolled Courses', 14, 95);

    let y = 105;
    subjects.forEach((s, idx) => {
      doc.text(`${idx + 1}. ${s.name} (${s.code}) - Difficulty: ${s.difficulty}`, 14, y);
      y += 8;
    });

    doc.save('Study_Wizard_Report.pdf');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#6C63FF]" />
          <span>Student Profile & Preferences</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your learning style, daily study hours, notification preferences, and data exports.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>Profile preferences saved successfully! AI scheduler updated.</span>
        </div>
      )}

      {/* Main Profile Form Card */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-6">
        
        <h3 className="text-sm font-bold text-slate-900 dark:text-white font-outfit border-b border-slate-100 dark:border-slate-700/60 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-[#6C63FF]" />
          <span>Academic Information</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">College / University</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Semester</label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Year</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
            />
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-white font-outfit border-b border-slate-100 dark:border-slate-700/60 pb-3 pt-2">
          AI Scheduling Inputs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Learning Style</label>
            <select
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
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
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Preferred Study Time</label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
            >
              <option value="Morning">Morning (07:00 AM - 12:00 PM)</option>
              <option value="Afternoon">Afternoon (01:00 PM - 05:00 PM)</option>
              <option value="Evening">Evening (04:00 PM - 09:00 PM)</option>
              <option value="Night">Night (08:00 PM - 01:00 AM)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-[#6C63FF] text-white text-xs font-bold rounded-xl hover:bg-[#5B52E0] transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </form>

      {/* Theme & Data Export Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Theme Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white font-outfit">Appearance Theme</h4>
            <p className="text-xs text-slate-400 mt-0.5">Toggle light/dark visual mode</p>
          </div>

          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-2xl text-xs font-bold transition"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>

        {/* Data Export Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-3">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white font-outfit">Export Academic Data</h4>
          <p className="text-xs text-slate-400">Download performance reports and raw study session logs.</p>

          <div className="flex gap-3">
            <button
              onClick={handleGeneratePDFReport}
              className="flex-1 py-2.5 bg-[#6C63FF] text-white text-xs font-bold rounded-xl hover:bg-[#5B52E0] transition flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Data</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
