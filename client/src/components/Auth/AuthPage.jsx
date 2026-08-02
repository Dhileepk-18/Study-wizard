import React, { useState } from 'react';
import { Mail, Lock, User, Check, AlertCircle, Eye, EyeOff, ArrowRight, Wand2, BookOpen, Timer, BarChart3, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const features = [
  { icon: BookOpen,  label: 'Adaptive AI Scheduling',      desc: 'Priority-based schedule that evolves with you' },
  { icon: Timer,     label: 'Pomodoro Focus Sessions',      desc: 'Built-in ambient sounds & focus tracking' },
  { icon: BarChart3, label: 'Performance Analytics',        desc: 'Deep insights on study patterns & weak areas' },
  { icon: Trophy,    label: 'XP & Gamification',            desc: 'Streaks, badges, and level progression' },
];

export default function AuthPage({ isRegisterInitial = false }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(isRegisterInitial);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUpper     = /[A-Z]/.test(password);
  const hasLower     = /[a-z]/.test(password);
  const hasNumber    = /[0-9]/.test(password);
  const hasSpecial   = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passChecks   = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial];
  const passStrength = passChecks.filter(Boolean).length;
  const isPasswordValid = passStrength === 5;

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (isRegister) {
      if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); return; }
      if (!isPasswordValid) { setErrorMsg('Password does not meet all requirements.'); return; }
    }
    try {
      setLoading(true);
      if (isRegister) {
        await register(fullName, email, password);
        setSuccessMsg('Account created! Welcome to Study Wizard.');
      } else {
        await login(email, password);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.error || err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ['bg-slate-300', 'bg-rose-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-500'];
  const strengthLabels  = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient background orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7)] border border-white/[0.08] animate-scale-in">

        {/* Left — Branding Panel */}
        <div className="lg:col-span-2 hero-mesh p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Ambient noise overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
          />

          {/* Floating orb */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none animate-float" />
          <div className="absolute -left-8 -bottom-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/30">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white font-outfit tracking-tight leading-none">Study Wizard</h1>
                <p className="text-[10px] text-purple-200/80 font-bold uppercase tracking-widest mt-0.5">Neural Academy AI</p>
              </div>
            </div>

            <span className="inline-block px-3 py-1.5 bg-white/15 backdrop-blur-md text-[11px] font-bold rounded-full mb-4 uppercase tracking-wider text-white/90 border border-white/20">
              AI Adaptive Study Planner
            </span>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-white font-outfit leading-tight mb-3">
              Master your exams with the power of AI
            </h2>

            <p className="text-purple-100/80 text-sm leading-relaxed">
              Adaptive scheduling, spaced repetition, and deep analytics — all in one place.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="relative z-10 space-y-2.5 my-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 animate-fade-in-up"
                  style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white leading-tight">{f.label}</p>
                    <p className="text-[11px] text-purple-200/70 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="relative z-10 text-[11px] text-purple-200/60">
            Secure · JWT Authentication · Data Privacy Protected
          </p>
        </div>

        {/* Right — Auth Form */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0D1424] p-8 lg:p-10 flex flex-col justify-center">

          {/* Tab Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-white/[0.06] rounded-2xl mb-7 gap-1">
            {['Sign In', 'Register'].map((label, i) => {
              const active = i === 0 ? !isRegister : isRegister;
              return (
                <button key={label}
                  onClick={() => { setIsRegister(i === 1); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-250
                    ${active
                      ? 'bg-white dark:bg-[#1A2540] text-slate-900 dark:text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-outfit mb-1">
            {isRegister ? 'Create your account' : 'Welcome back 👋'}
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6">
            {isRegister
              ? 'Join thousands of students studying smarter.'
              : 'Sign in to continue your learning journey.'}
          </p>

          {/* Error / Success Messages */}
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 text-[12px] rounded-2xl flex items-center gap-2.5 border border-rose-200 dark:border-rose-900/50">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 text-[12px] rounded-2xl flex items-center gap-2.5 border border-emerald-200 dark:border-emerald-900/50">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {isRegister && (
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input type="text" required placeholder="Your Full Name" value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="auth-input pl-11 pr-4 py-3 text-[13px]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input type="email" required placeholder="name@university.edu" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="auth-input pl-11 pr-4 py-3 text-[13px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="auth-input pl-11 pr-12 py-3 text-[13px]"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <>
                {/* Password Strength Bar */}
                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1 h-1.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= passStrength ? strengthColors[passStrength] : 'bg-slate-200 dark:bg-slate-700'}`} />
                      ))}
                    </div>
                    <p className="text-[11px] font-semibold" style={{ color: passStrength <= 2 ? '#ef4444' : passStrength <= 3 ? '#f59e0b' : '#10b981' }}>
                      {strengthLabels[passStrength]} Password
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="auth-input pl-11 pr-4 py-3 text-[13px]"
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="grid grid-cols-2 gap-1.5 p-3 bg-slate-50 dark:bg-white/[0.04] rounded-2xl text-[11px] border border-slate-100 dark:border-white/[0.05]">
                  {[
                    [hasMinLength, '8+ characters'],
                    [hasUpper, 'Uppercase letter'],
                    [hasLower, 'Lowercase letter'],
                    [hasNumber, 'Number'],
                    [hasSpecial, 'Special character'],
                  ].map(([ok, label], i) => (
                    <div key={i} className={`flex items-center gap-1.5 font-semibold ${ok ? 'text-emerald-500' : 'text-slate-400'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        {ok && <Check className="w-2 h-2 text-white" />}
                      </div>
                      {label}
                    </div>
                  ))}
                </div>
              </>
            )}

            {!isRegister && (
              <div className="flex items-center justify-between text-[12px]">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="rounded accent-violet-600" />
                  <span>Remember me</span>
                </label>
                <button type="button" className="text-violet-600 dark:text-violet-400 font-semibold hover:underline">Forgot password?</button>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-primary-gradient text-white font-bold text-[14px] rounded-2xl shadow-xl shadow-violet-500/30
                flex items-center justify-center gap-2.5 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <>
                  <span>{isRegister ? 'Create Student Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
