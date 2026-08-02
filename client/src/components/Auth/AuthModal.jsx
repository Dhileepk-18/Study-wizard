import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isLogin) {
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      const valErr = validatePassword(password);
      if (valErr) {
        setErrorMsg(valErr);
        return;
      }
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(fullName, email, password);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#4F8EF7] text-white flex items-center justify-center text-xl shadow-lg">
            🧙‍♂️
          </div>
          <h2 className="text-xl font-bold font-outfit text-slate-900 dark:text-white">
            {isLogin ? 'Welcome Back to Study Wizard' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">AI Powered Adaptive Study Planner</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!isLogin && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800 border rounded-xl focus:ring-2 focus:ring-[#6C63FF] outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#6C63FF] text-white font-bold rounded-xl hover:bg-[#5B52E0] transition shadow-lg shadow-purple-500/20"
          >
            {isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-slate-500">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setIsLogin(false)} className="text-[#6C63FF] font-bold hover:underline">
                Register
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button onClick={() => setIsLogin(true)} className="text-[#6C63FF] font-bold hover:underline">
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
