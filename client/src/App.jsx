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

function MainLayout() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [showAuthPage, setShowAuthPage] = useState(false);

  if (showAuthPage || (!token && !user)) {
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
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <MainLayout />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


