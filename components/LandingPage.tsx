
import React from 'react';
import { RequestType } from '../types';

interface LandingPageProps {
  onSelectAction?: (type: RequestType) => void;
  onLoginClick: () => void;
  isDarkMode?: boolean;
  onToggleDark?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  return (
    <div 
      onClick={onLoginClick}
      className="fixed inset-0 w-full h-full min-h-[100dvh] bg-slate-950 overflow-hidden cursor-pointer select-none flex items-center justify-center z-50"
      title="Click anywhere to enter portal"
    >
      {/* Ambient blurred backdrop for mobile portrait screens */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img 
          src="/NEC.png" 
          alt="" 
          aria-hidden="true"
          className="w-full h-full object-cover object-center blur-2xl opacity-45 scale-110"
        />
        <div className="absolute inset-0 bg-slate-950/30"></div>
      </div>

      {/* Main College Gate Image: Fully visible on phone (contain) & full-bleed on desktop (cover) */}
      <img 
        src="/NEC.png" 
        alt="Narasaraopeta Engineering College" 
        className="relative z-10 w-full h-full object-contain sm:object-cover object-center shadow-2xl transition-transform duration-500"
      />

      {/* Floating Login Button (Top-Right) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLoginClick();
          }}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900/85 active:scale-95 backdrop-blur-md text-white border border-white/20 text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center gap-2 transition-all shadow-2xl hover:scale-105"
        >
          <span>Login</span>
          <i className="fas fa-arrow-right text-xs"></i>
        </button>
      </div>

      {/* Mobile-optimized bottom thumb action */}
      <div className="sm:hidden absolute bottom-6 inset-x-4 z-20 flex justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLoginClick();
          }}
          className="w-full max-w-xs py-3 px-6 rounded-2xl bg-indigo-600/90 hover:bg-indigo-600 active:scale-95 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl transition-all border border-white/20 backdrop-blur-md"
        >
          <span>Enter Portal</span>
          <i className="fas fa-arrow-right text-xs"></i>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;

