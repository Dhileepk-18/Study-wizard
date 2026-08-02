import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';

import Sidebar from './components/Navigation/Sidebar';
import Navbar from './components/Navigation/Navbar';
import MobileNav from './components/Navigation/MobileNav';
import QuickActionFAB from './components/Navigation/QuickActionFAB';
import AIChatbotDrawer from './components/AIChatbot/AIChatbotDrawer';
import AuthPage from './components/Auth/AuthPage';

import DashboardView from './components/Dashboard/DashboardView';
import SchedulePlanner from './components/Schedule/SchedulePlanner';
import SubjectManager from './components/Subjects/SubjectManager';
import ExamManager from './components/Exams/ExamManager';
import PomodoroTimer from './components/Pomodoro/PomodoroTimer';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import RevisionPlanner from './components/Revision/RevisionPlanner';
import GamificationCenter from './components/Gamification/GamificationCenter';
import ProfileSettingsView from './components/ProfileSettings/ProfileSettingsView';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Study Wizard Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorText = typeof this.state.error === 'object' && this.state.error !== null
        ? (this.state.error.message || JSON.stringify(this.state.error))
        : String(this.state.error || 'A runtime error occurred in the application.');

      return (
        <div className="min-h-screen bg-[#070B14] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-2xl font-bold font-outfit mb-2">Something went wrong</h2>
          <p className="text-slate-400 text-sm max-w-md mb-6 break-words font-mono text-xs bg-slate-900/60 p-4 rounded-xl border border-white/10">
            {errorText}
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('study_wizard_token');
              window.location.href = '/';
            }}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 font-bold rounded-xl text-sm transition-all"
          >
            Reset Session & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainLayout() {
  const { user, token, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [showAuthPage, setShowAuthPage] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading Study Wizard...</p>
      </div>
    );
  }

  if (showAuthPage || !token || !user) {
    return (
      <AuthPage
        onAuthSuccess={() => setShowAuthPage(false)}
      />
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'schedule':
        return <SchedulePlanner onNavigate={(tab) => setActiveTab(tab)} />;
      case 'subjects':
        return <SubjectManager />;
      case 'exams':
        return <ExamManager />;
      case 'pomodoro':
        return <PomodoroTimer />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'revision':
        return <RevisionPlanner />;
      case 'gamification':
        return <GamificationCenter />;
      case 'settings':
        return <ProfileSettingsView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#070B14] text-slate-800 dark:text-slate-100 pb-28 md:pb-0 overflow-x-hidden selection:bg-[#7C3AED] selection:text-white">
      
      {/* Ambient Mesh Glow Orbs */}
      <div className="fixed -top-40 -left-40 w-[28rem] h-[28rem] bg-violet-500/10 dark:bg-violet-600/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-[34rem] h-[34rem] bg-purple-500/8 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed -bottom-40 left-1/3 w-[28rem] h-[28rem] bg-fuchsia-500/8 dark:bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="flex relative z-10 min-h-screen">
        {/* Sidebar Navigation (Desktop) */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Navbar */}
          <Navbar
            onOpenChat={() => setIsChatOpen(true)}
            globalSearch={globalSearch}
            setGlobalSearch={setGlobalSearch}
            onOpenAuth={() => setShowAuthPage(true)}
            onNavigate={(tab) => setActiveTab(tab)}
          />

          {/* Dynamic Page View Container */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in-up">
            {renderTabContent()}
          </main>
        </div>
      </div>

      {/* Mobile Navigation Bar & Drawer */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Quick Action Floating Action Button */}
      <QuickActionFAB onNavigate={(tab) => setActiveTab(tab)} />

      {/* AI Assistant Chatbot Drawer */}
      <AIChatbotDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <MainLayout />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}


