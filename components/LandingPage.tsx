
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
      className="fixed inset-0 w-screen h-screen min-h-[100dvh] overflow-hidden cursor-pointer bg-black z-50 select-none"
      title="Click anywhere to enter portal"
    >
      <img 
        src="/NEC.png" 
        alt="Narasaraopeta Engineering College" 
        className="w-full h-full object-cover object-center"
      />

      {/* Subtle Floating Login Button */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLoginClick();
          }}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-black/45 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 text-xs sm:text-sm font-bold tracking-wider uppercase flex items-center gap-2 transition-all shadow-2xl hover:scale-105"
        >
          <span>Login</span>
          <i className="fas fa-arrow-right text-xs"></i>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;

