
import React from 'react';
import { RequestType } from '../types';

interface LandingPageProps {
  onSelectAction: (type: RequestType) => void;
  onLoginClick: () => void;
  isDarkMode: boolean;
  onToggleDark: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectAction, onLoginClick, isDarkMode, onToggleDark }) => {
  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#e4ebf5] dark:bg-[#0f1219] text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300 overflow-x-hidden">
      <header className="p-5 md:px-10 flex justify-between items-center neu-flat sticky top-0 z-20">
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          <div 
            className="p-1.5 sm:p-2 neu-logo-box dark:bg-white rounded-2xl cursor-default overflow-hidden flex items-center justify-center" 
            data-logo-box="company"
            title="RANBIDGE Solutions Private Limited"
          >
            <img 
              src="/RANBIDGE-Solutions-PVT-LTD-Logo.png" 
              alt="RANBIDGE Solutions" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain" 
              style={{ transform: 'scale(1.45)' }}
            />
          </div>
          <div className="p-2 neu-logo-box dark:bg-white rounded-2xl" data-logo-box="nec">
            <img 
              src="/nec-logo.png" 
              alt="NEC Logo" 
              className="w-9 h-9 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none uppercase">
              NEC Portal
            </span>
            <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mt-1">
              Narasaraopeta Engineering College
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onToggleDark}
            className="neu-icon-btn"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <i className={`fas ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-500'} text-base`}></i>
          </button>
          <button 
            onClick={onLoginClick}
            className="neu-btn-primary text-xs md:text-sm uppercase tracking-wider py-2.5 px-5"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Login
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="text-center mb-12 animate-fade-in relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 neu-pill-inset text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Campus Workflow & Clearance Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-white mb-4 tracking-tight">
            NEC <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Student Portal</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Quickly submit your permission requests or record your late attendance with our multi-tier automated workflow system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10 px-2 sm:px-4">
          {/* Permission Portal Card */}
          <div
            onClick={() => onSelectAction(RequestType.PERMISSION)}
            className="neu-card-interactive p-8 md:p-12 text-center cursor-pointer group flex flex-col items-center justify-between"
          >
            <div className="w-full flex flex-col items-center">
              <div className="w-24 h-24 neu-flat rounded-3xl flex items-center justify-center mb-6 group-hover:scale-105 transition-all text-indigo-600 dark:text-indigo-400">
                <i className="fas fa-file-signature text-3xl"></i>
              </div>
              <div className="inline-flex items-center px-3 py-1 neu-pill-inset text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
                Permission Request
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-3">
                Permission Portal
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">
                Fast-track campus leave, outing permissions, or event authorizations with multi-tier approval.
              </p>
            </div>
            <button className="neu-btn-primary w-full text-xs uppercase tracking-wider py-3.5">
              <span className="mr-2">Enter Portal</span>
              <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>

          {/* Attendance Hub Card */}
          <div
            onClick={() => onSelectAction(RequestType.LATE_ATTENDANCE)}
            className="neu-card-interactive p-8 md:p-12 text-center cursor-pointer group flex flex-col items-center justify-between"
          >
            <div className="w-full flex flex-col items-center">
              <div className="w-24 h-24 neu-flat rounded-3xl flex items-center justify-center mb-6 group-hover:scale-105 transition-all text-emerald-600 dark:text-emerald-400">
                <i className="fas fa-clock text-3xl"></i>
              </div>
              <div className="inline-flex items-center px-3 py-1 neu-pill-inset text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Late Attendance
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-3">
                Attendance Hub
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">
                Intelligent late arrival logging with automated reason verification and timestamp tracking.
              </p>
            </div>
            <button className="neu-btn-emerald w-full text-xs uppercase tracking-wider py-3.5">
              <span className="mr-2">Access Hub</span>
              <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
