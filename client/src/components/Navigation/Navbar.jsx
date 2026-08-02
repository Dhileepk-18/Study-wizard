import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, Flame, Sparkles, LogOut, KeyRound, BookOpen, GraduationCap, FileText, X, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export default function Navbar({ onOpenChat, globalSearch, setGlobalSearch, onOpenAuth, onNavigate }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const { notifications, gamification, markNotificationRead, subjects, exams } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const searchResults = (() => {
    const q = (globalSearch || '').trim().toLowerCase();
    if (!q) return [];
    const results = [];
    subjects.forEach(s => {
      if (s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q))) {
        results.push({ type: 'Subject', title: s.name, subtitle: `${s.code || 'N/A'} · ${s.difficulty}`, tab: 'subjects', icon: BookOpen, color: s.color || '#7C3AED' });
      }
      if (s.units) {
        s.units.forEach(u => {
          if (u.topics) {
            u.topics.forEach(t => {
              if (t.name.toLowerCase().includes(q)) {
                results.push({ type: 'Topic', title: t.name, subtitle: `${s.name} · ${u.title}`, tab: 'subjects', icon: FileText, color: s.color || '#7C3AED' });
              }
            });
          }
        });
      }
    });
    exams.forEach(e => {
      if (e.examName.toLowerCase().includes(q) || (e.subjectName && e.subjectName.toLowerCase().includes(q))) {
        results.push({ type: 'Exam', title: e.examName, subtitle: `${e.subjectName} · Target: ${e.targetMarks}/${e.maximumMarks}`, tab: 'exams', icon: GraduationCap, color: '#F59E0B' });
      }
    });
    return results.slice(0, 8);
  })();

  const userInitial = user?.fullName ? user.fullName[0].toUpperCase() : 'S';

  return (
    <header className="sticky top-0 z-30 transition-all duration-300
      bg-white/75 dark:bg-[#070B14]/80 backdrop-blur-2xl
      border-b border-slate-200/60 dark:border-white/[0.06]
      px-4 md:px-8 py-3">

      <div className="flex items-center justify-between gap-3">

        {/* Search */}
        <div className="relative flex-1 max-w-lg">
          <div className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-2xl text-sm transition-all duration-250
            bg-slate-100/90 dark:bg-white/[0.06]
            border ${searchFocused || globalSearch
              ? 'border-violet-400/60 dark:border-violet-500/50 shadow-[0_0_0_3px_rgba(124,58,237,0.12)]'
              : 'border-slate-200/80 dark:border-white/[0.07]'}`}>
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              id="global-search"
              type="text"
              placeholder="Search subjects, topics, exams..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="flex-1 bg-transparent text-[13px] font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
            />
            {globalSearch && (
              <button onClick={() => setGlobalSearch('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Live Search Dropdown */}
          {globalSearch.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-2 py-2 rounded-2xl shadow-2xl border z-50 animate-slide-up
              bg-white/97 dark:bg-[#0D1424]/97 backdrop-blur-xl
              border-slate-200 dark:border-white/[0.08]
              shadow-slate-200/50 dark:shadow-black/60">
              <p className="px-4 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/[0.06] mb-1">
                Results ({searchResults.length})
              </p>
              {searchResults.length === 0 ? (
                <p className="px-4 py-4 text-center text-[12px] text-slate-400">No results for "{globalSearch}"</p>
              ) : (
                searchResults.map((res, idx) => {
                  const Icon = res.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => { if (onNavigate) onNavigate(res.tab); setGlobalSearch(''); }}
                      className="px-3 py-2.5 flex items-center gap-3 hover:bg-violet-50/80 dark:hover:bg-violet-950/30 cursor-pointer mx-1.5 rounded-xl transition-colors"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: res.color }}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-900 dark:text-white truncate">{res.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">{res.subtitle}</p>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.07] text-slate-500 uppercase tracking-wide">
                        {res.type}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">

          {/* AI Assistant Button */}
          <button
            id="ai-assistant-btn"
            onClick={onOpenChat}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl text-[12px] font-bold transition-all duration-200
              bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/40
              text-violet-600 dark:text-violet-300
              border border-violet-200/80 dark:border-violet-800/60
              hover:shadow-lg hover:shadow-violet-500/15 hover:-translate-y-0.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>AI Assistant</span>
          </button>

          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-[12px] font-extrabold
            bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/40
            text-amber-600 dark:text-amber-400
            border border-amber-200/70 dark:border-amber-900/50">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-grotesk">{gamification?.currentStreak || 0}</span>
            <span className="text-[10px] font-bold hidden sm:inline">day streak</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
              className="relative p-2.5 rounded-2xl text-slate-500 dark:text-slate-400
                hover:bg-slate-100 dark:hover:bg-white/[0.06]
                hover:text-slate-800 dark:hover:text-slate-200
                transition-all duration-200"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white font-black text-[9px] flex items-center justify-center rounded-full shadow-md shadow-rose-500/40 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 rounded-2xl shadow-2xl border z-50 animate-slide-up overflow-hidden
                bg-white/97 dark:bg-[#0D1424]/97 backdrop-blur-xl
                border-slate-200 dark:border-white/[0.07]">
                <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06]">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white font-outfit">Notifications</h4>
                  <span className="text-[11px] font-bold text-violet-500 bg-violet-50 dark:bg-violet-950/60 px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-5 text-center text-[12px] text-slate-400">No notifications yet</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n._id} onClick={() => markNotificationRead(n._id)}
                        className={`p-3.5 flex gap-3 items-start cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]
                          ${!n.read ? 'bg-violet-50/50 dark:bg-violet-950/20' : ''}`}>
                        <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/60 text-violet-600 dark:text-violet-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 bg-violet-500 rounded-full mt-1.5 flex-shrink-0" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            id="theme-toggle"
            onClick={toggleDarkMode}
            title="Toggle theme"
            className="p-2.5 rounded-2xl text-slate-500 dark:text-slate-400
              hover:bg-slate-100 dark:hover:bg-white/[0.06]
              transition-all duration-200"
          >
            {darkMode
              ? <Sun className="w-5 h-5 text-amber-400" />
              : <Moon className="w-5 h-5 text-indigo-500" />}
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              id="profile-btn"
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-2xl transition-all duration-200
                bg-slate-100/80 dark:bg-white/[0.06]
                border border-slate-200/70 dark:border-white/[0.07]
                hover:bg-slate-200/60 dark:hover:bg-white/[0.09]"
            >
              <div className="w-7 h-7 rounded-xl bg-primary-gradient text-white flex items-center justify-center font-black text-xs shadow-md shadow-violet-500/30">
                {userInitial}
              </div>
              <span className="hidden md:block text-[12px] font-semibold text-slate-700 dark:text-slate-200 max-w-[90px] truncate">
                {user?.fullName || 'Student'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2.5 w-52 rounded-2xl shadow-2xl border z-50 animate-scale-in overflow-hidden
                bg-white/97 dark:bg-[#0D1424]/97 backdrop-blur-xl
                border-slate-200 dark:border-white/[0.07]">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.06]">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{user?.fullName || 'Student'}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email || 'student@study.wizard'}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { setShowProfileMenu(false); if (onOpenAuth) onOpenAuth(); }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-[12px] font-semibold text-slate-700 dark:text-slate-300
                      hover:bg-violet-50 dark:hover:bg-violet-950/40 flex items-center gap-2.5 transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-violet-500" />
                    <span>Login / Switch User</span>
                  </button>
                  <button
                    onClick={() => { logout(); setShowProfileMenu(false); }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-[12px] font-semibold text-rose-600
                      hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
