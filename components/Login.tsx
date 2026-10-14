
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Footer from './Footer';
import CreateAccount from './CreateAccount';
import { supabaseService } from '../services/supabaseService';

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
    
    try {
      if (!supabaseService.isAvailable()) {
        setError('Database connection not available. Please try again later.');
        return;
      }

      // Get user from database
      const user = await supabaseService.getUserById(uid);
      
      if (user && user.password_hash === pass) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Please check your username and password.');
      }
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
        <div className="min-h-screen flex flex-col bg-[#e4ebf5] dark:bg-[#0f1219] text-slate-800 dark:text-slate-100 p-4 sm:p-6 relative overflow-hidden transition-colors duration-300">
          {/* Subtle Neumorphic background depth blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>

          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-md w-full flex flex-col gap-6 relative z-10">
              <div className="neu-card p-8 md:p-12 relative overflow-hidden">
                <div className="flex justify-end items-center mb-6">
                  <button 
                    onClick={onToggleDark}
                    className="neu-icon-btn"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    <i className={`fas ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-400'}`}></i>
                  </button>
                </div>
                
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center mx-auto mb-4 p-4 neu-logo-box dark:bg-white rounded-3xl" data-logo-box="nec">
                    <img 
                      src="/nec-logo.png" 
                      alt="NEC Logo" 
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800 dark:text-white">
                    CollegeFlow
                  </h1>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-inset-sm text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    Narasaraopeta Engineering College
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-2xl neu-inset text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center">
                    <i className="fas fa-exclamation-circle text-base mr-3 flex-shrink-0"></i> 
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 ml-1">
                      ID Number / Staff ID
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
                        className="neu-input text-center px-12 tracking-wide font-medium"
                        placeholder="e.g. 21NE1A0501"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 ml-1">
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
                        className="neu-input text-center px-12 tracking-widest font-medium"
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
                </form>

                <div className="mt-8 pt-6 border-t border-slate-300/40 dark:border-slate-800/80 text-center">
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
          <div className="h-6"></div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default Login;
