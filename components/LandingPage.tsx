
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <header className="p-6 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-20 transition-colors">
        <div className="flex items-center space-x-3">
          <img 
            src="https://www.facultyplus.com/wp-content/uploads/2024/04/NEC-Andhra-Prdaesh.png" 
            alt="NEC Logo" 
            className="w-10 h-10 object-contain p-[5px] bg-white rounded-lg shadow-lg shadow-slate-900/20"
          />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none uppercase">NEC Portal</span>
            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 tracking-tighter uppercase mt-1">Narasaraopeta Engineering College</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={onToggleDark}
            className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
          >
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
          </button>
          <button 
            onClick={onLoginClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Login
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-100 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-50 dark:bg-emerald-900/10 rounded-full blur-3xl opacity-50 translate-x-1/3 translate-y-1/3"></div>

        <div className="text-center mb-12 animate-fade-in relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            NEC <span className="text-indigo-600 dark:text-indigo-400">Student Portal</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Quickly submit your permission requests or record your late attendance with our automated workflow system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10 px-4">
          <button
            onClick={() => onSelectAction(RequestType.PERMISSION)}
            className="group relative bg-gradient-to-br from-white via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-12 rounded-[2.5rem] shadow-2xl border border-indigo-100/50 dark:border-indigo-900/50 text-center transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.25)] hover:border-indigo-200 dark:hover:border-indigo-800 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/25 group-hover:shadow-2xl group-hover:shadow-indigo-500/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <i className="fas fa-file-signature text-3xl"></i>
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest mb-4">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
                Premium Access
              </div>
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400 mb-3">Permission Portal</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">Advanced permission management with AI-powered approval workflow and real-time tracking.</p>
              <div className="inline-flex items-center text-white font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 group-hover:scale-105">
                <span className="mr-2">Enter Portal</span>
                <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectAction(RequestType.LATE_ATTENDANCE)}
            className="group relative bg-gradient-to-br from-white via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 p-12 rounded-[2.5rem] shadow-2xl border border-emerald-100/50 dark:border-emerald-900/50 text-center transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.25)] hover:border-emerald-200 dark:hover:border-emerald-800 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/25 group-hover:shadow-2xl group-hover:shadow-emerald-500/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <i className="fas fa-clock text-3xl"></i>
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-widest mb-4">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Smart Logging
              </div>
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-emerald-600 dark:from-white dark:to-emerald-400 mb-3">Attendance Hub</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed mb-6">Intelligent attendance tracking with automated compliance checks and detailed analytics.</p>
              <div className="inline-flex items-center text-white font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 group-hover:scale-105">
                <span className="mr-2">Access Hub</span>
                <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </div>
            </div>
          </button>
        </div>
      </main>

      <footer className="p-8 text-center text-slate-400 dark:text-slate-600 text-sm bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <img src="/RANBIDGE-Solutions-PVT-LTD-Logo.png" alt="RANBIDGE Solutions Private Limited Logo" className="h-14 w-auto p-1 bg-white rounded-lg shadow-lg shadow-slate-900/20" />
          <span className="font-bold text-slate-500 dark:text-slate-600 tracking-widest text-[10.3px] uppercase leading-none">RANBIDGE Solutions Private Limited</span>
        </div>
        <div className="space-y-1">
          <p>&copy; 2026 NEC Portal. All rights reserved to RANBIDGE Solutions Private Limited.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
