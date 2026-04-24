
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Footer from './Footer';
import CreateAccount from './CreateAccount';

interface LoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
  isDarkMode: boolean;
  onToggleDark: () => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Admin', id: 'technoelite@nec', icon: 'fa-user-shield', color: 'bg-indigo-500' },
  { label: 'HOD', id: 'technoelite@hodnec', icon: 'fa-user-tie', color: 'bg-blue-500' },
  { label: 'Mentor', id: 'technoelite@mentornec', icon: 'fa-user-graduate', color: 'bg-emerald-500' },
  { label: 'Security', id: 'technoelite@securitynec', icon: 'fa-shield-halved', color: 'bg-rose-500' },
  { label: 'Student', id: '21NE1A0501', icon: 'fa-user', color: 'bg-slate-500' },
];

const Login: React.FC<LoginProps> = ({ onLogin, onBack, isDarkMode, onToggleDark }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processLogin(username, password);
  };

  const processLogin = (uid: string, pass: string) => {
    setError('');
    const VALID_PASS = 'technoelite@2025';
    
    let role: UserRole | null = null;
    let name = '';
    let id = '';

    const lowerUsername = uid.toLowerCase().trim();

    if (pass === VALID_PASS) {
      if (lowerUsername === 'technoelite@nec') {
        role = UserRole.ADMIN;
        name = 'System Administrator';
        id = 'ADMIN-001';
      } else if (lowerUsername === 'technoelite@mentornec' || lowerUsername === 'technoelite@mentoenec') {
        role = UserRole.MENTOR;
        name = 'Mentor Coordinator';
        id = 'MENTOR-001';
      } else if (lowerUsername === 'technoelite@hodnec') {
        role = UserRole.HOD;
        name = 'Head of Department';
        id = 'HOD-001';
      } else if (lowerUsername === 'technoelite@securitynec') {
        role = UserRole.SECURITY;
        name = 'Security Supervisor';
        id = 'SEC-001';
      } else if (uid.trim().length > 0) {
        role = UserRole.STUDENT;
        id = uid.trim().toUpperCase();
        name = id;
      }
    }

    if (role) {
      onLogin({
        id: id,
        name: name,
        email: lowerUsername.includes('@') ? lowerUsername : `${id.toLowerCase()}@nec.edu`,
        role: role,
        branch: 'Computer Science',
        year: role === UserRole.STUDENT ? '3rd Year' : undefined
      });
    } else {
      setError('Authentication failed. Use the demo credentials below.');
    }
  };

  const handleDemoFill = (id: string) => {
    setUsername(id);
    setPassword('technoelite@2025');
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
        <div className="min-h-screen flex flex-col bg-slate-900 dark:bg-black p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] -ml-48 -mb-48"></div>

          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-md w-full flex flex-col gap-6 relative z-10">
              <div className="bg-white dark:bg-slate-900/80 rounded-[2.5rem] shadow-2xl backdrop-blur-xl overflow-hidden p-8 md:p-12 animate-fade-in border border-white/20 dark:border-slate-800">
          <div className="flex justify-end mb-4">
             <button 
               onClick={onToggleDark}
               className="p-2 text-slate-400 dark:text-slate-600 hover:text-indigo-500 transition-colors"
             >
               <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
             </button>
          </div>
          
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mx-auto mb-6">
              <img 
                src="https://www.facultyplus.com/wp-content/uploads/2024/04/NEC-Andhra-Prdaesh.png" 
                alt="NEC Logo" 
                className="w-20 h-20 object-contain p-[5px] bg-white rounded-lg shadow-lg shadow-slate-900/20"
              />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Portal Access</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Narasaraopeta Engineering College</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-700 dark:text-rose-400 text-sm font-semibold rounded-r-xl flex items-center animate-shake">
              <i className="fas fa-exclamation-triangle mr-3"></i> {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">
                ID Number or Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600">
                  <i className="fas fa-id-badge"></i>
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-700 transition-all text-slate-900 dark:text-white font-medium"
                  placeholder="Enter Your ID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl transition-all transform active:scale-95 shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20"
            >
              Authenticate Session
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setShowDemo(!showDemo)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 text-sm font-bold transition-colors"
            >
              <span className="flex items-center">
                <i className="fas fa-key mr-3 text-indigo-500"></i>
                Demo Credentials
              </span>
              <i className={`fas fa-chevron-${showDemo ? 'up' : 'down'} text-xs`}></i>
            </button>

            {showDemo && (
              <div className="mt-4 grid grid-cols-2 gap-2 animate-slide-down">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleDemoFill(acc.id)}
                    className="flex flex-col items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all text-left"
                  >
                    <div className={`w-8 h-8 ${acc.color} text-white rounded-lg flex items-center justify-center mb-2 shadow-sm`}>
                      <i className={`fas ${acc.icon} text-xs`}></i>
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-600">{acc.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleCreateAccount}
              className="w-full text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
            >
              <i className="fas fa-user-plus mr-2"></i>
              Create a new account
            </button>
          </div>
        </div>
        </div>
      </div>
      <div className="h-8"></div>
      <Footer />
    </div>
      )}
    </>
  );
};

export default Login;
