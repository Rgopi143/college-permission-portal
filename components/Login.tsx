
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import CreateAccount from './CreateAccount';
import { supabaseService } from '../services/supabaseService';
import { DEFAULT_USERS } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
  isDarkMode: boolean;
  onToggleDark: () => void;
}


const Login: React.FC<LoginProps> = ({ onLogin, onBack, isDarkMode, onToggleDark }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processLogin(username, password);
  };

  const processLogin = async (uid: string, pass: string) => {
    setError('');
    const inputIdentifier = uid.trim();
    const inputPassword = pass.trim();

    if (!inputIdentifier || !inputPassword) {
      setError('Please enter both your Roll Number / Email and password.');
      return;
    }

    const lowerId = inputIdentifier.toLowerCase();

    // Helper for password matching (case-insensitive fallback for mobile keyboard convenience)
    const matchesPassword = (storedPassword?: string) => {
      if (!storedPassword) return false;
      return storedPassword === pass || storedPassword === inputPassword || storedPassword.toUpperCase() === inputPassword.toUpperCase();
    };

    // Helper to test if a user record matches the identifier
    const matchesIdentifier = (u: User) => {
      return (
        u.email?.toLowerCase() === lowerId ||
        u.id?.toLowerCase() === lowerId ||
        u.studentId?.toLowerCase() === lowerId
      );
    };

    try {
      // 1. Check in Predefined Default Users (includes student 23471a4245@nrtec.in / CHINNU143)
      const predefinedMatch = DEFAULT_USERS.find(u => matchesIdentifier(u) && matchesPassword(u.password_hash));
      if (predefinedMatch) {
        onLogin(predefinedMatch);
        return;
      }

      // 2. Check in Locally Registered Users (localStorage)
      const savedLocalUsersStr = localStorage.getItem('collegeflow_registered_users');
      if (savedLocalUsersStr) {
        try {
          const localUsers: User[] = JSON.parse(savedLocalUsersStr);
          const localMatch = localUsers.find(u => matchesIdentifier(u) && matchesPassword(u.password_hash));
          if (localMatch) {
            onLogin(localMatch);
            return;
          }
        } catch (e) {
          console.error('Error checking local users:', e);
        }
      }

      // 3. Check in Supabase if available
      if (supabaseService.isAvailable()) {
        try {
          const user = await supabaseService.getUserById(inputIdentifier);
          if (user && matchesPassword(user.password_hash)) {
            onLogin(user);
            return;
          }
        } catch (dbErr) {
          console.warn('Supabase authentication check failed:', dbErr);
        }
      }

      // If credentials do not match
      setError('Invalid credentials. Please check your roll number/email and password.');
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
  };

  const handleCreateAccount = () => {
    setShowCreateAccount(true);
  };

  const handleAccountCreated = (user: User) => {
    onLogin(user);
  };

  const handleBackToLogin = () => {
    setShowCreateAccount(false);
  };

  return (
    <>
      {showCreateAccount ? (
        <CreateAccount
          onAccountCreated={handleAccountCreated}
          onBack={handleBackToLogin}
          isDarkMode={isDarkMode}
          onToggleDark={onToggleDark}
        />
      ) : (
        <div className="min-h-screen flex flex-col bg-[#e4ebf5] dark:bg-[#0f1219] text-slate-800 dark:text-slate-100 p-3 sm:p-6 relative overflow-hidden transition-colors duration-300">
          {/* Subtle Neumorphic background depth blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>

          <div className="flex-1 flex items-center justify-center py-4">
            <div className="max-w-md w-full flex flex-col gap-6 relative z-10 px-1 sm:px-0">
              <div className="neu-card p-5 sm:p-8 md:p-12 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <div 
                    className="neu-icon-btn !w-9 !h-9 sm:!w-11 sm:!h-11 !p-1.5 flex items-center justify-center dark:bg-white rounded-xl shadow-sm cursor-default" 
                    data-logo-box="company"
                    title="RANBIDGE Solutions Private Limited"
                  >
                    <img 
                      src="/RANBIDGE-Solutions-PVT-LTD-Logo.png" 
                      alt="RANBIDGE Solutions" 
                      className="w-full h-full object-contain" 
                    />
                  </div>
                  <button 
                    onClick={onToggleDark}
                    className="neu-icon-btn !w-9 !h-9 sm:!w-11 sm:!h-11"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    <i className={`fas ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-400'} text-sm sm:text-base`}></i>
                  </button>
                </div>
                
                <div className="text-center mb-6 sm:mb-8">
                  <div className="inline-flex items-center justify-center mx-auto mb-3 sm:mb-4 p-3 sm:p-4 neu-logo-box dark:bg-white rounded-3xl" data-logo-box="nec">
                    <img 
                      src="/nec-logo.png" 
                      alt="NEC Logo" 
                      className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                    />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                    CollegeFlow
                  </h1>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-inset-sm text-[10px] sm:text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    Narasaraopeta Engineering College
                  </div>
                </div>

                {error && (
                  <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 rounded-2xl neu-inset text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center">
                    <i className="fas fa-exclamation-circle text-base mr-2.5 sm:mr-3 flex-shrink-0"></i> 
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 ml-1">
                      Roll Number / Email / Staff ID
                    </label>
                    <div className="relative flex items-center">
                      <span className="neu-input-icon text-slate-400 dark:text-slate-300">
                        <i className="fas fa-id-badge text-sm"></i>
                      </span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="neu-input text-center px-10 sm:px-12 tracking-wide font-medium text-sm sm:text-base"
                        placeholder="e.g. 23471a4245@nrtec.in or 23471A4245"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 ml-1">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <span className="neu-input-icon text-slate-400 dark:text-slate-300">
                        <i className="fas fa-lock text-sm"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="neu-input text-center px-10 sm:px-12 tracking-widest font-medium text-sm sm:text-base"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="neu-input-icon-right text-slate-400 hover:text-indigo-500 dark:text-slate-300 dark:hover:text-indigo-400"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full neu-btn-primary mt-2 text-sm tracking-wide"
                  >
                    <i className="fas fa-right-to-bracket mr-2"></i>
                    Authenticate Session
                  </button>

                  <div className="pt-2 flex flex-col items-center justify-center gap-1.5 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Fill Demo</span>
                    <button
                      type="button"
                      onClick={() => {
                        setUsername('23471a4245@nrtec.in');
                        setPassword('CHINNU143');
                      }}
                      className="px-3 py-1.5 rounded-xl neu-btn text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all flex items-center gap-1.5"
                    >
                      <i className="fas fa-user-graduate text-xs"></i>
                      <span>23471a4245@nrtec.in</span>
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-5 border-t border-slate-300/40 dark:border-slate-800/80 text-center">
                  <button
                    onClick={handleCreateAccount}
                    className="neu-btn text-xs font-bold text-indigo-600 dark:text-indigo-400 py-2.5 px-5 rounded-xl w-full"
                  >
                    <i className="fas fa-user-plus mr-2"></i>
                    Create New Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
