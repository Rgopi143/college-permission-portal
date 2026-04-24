import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="p-6 text-center text-slate-400 dark:text-slate-600 text-xs bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors mt-auto">
      <div className="flex items-center justify-center space-x-3 mb-2">
        <img src="/RANBIDGE-Solutions-PVT-LTD-Logo.png" alt="RANBIDGE Solutions Private Limited Logo" className="h-[32.96px] w-auto" />
        <span className="font-bold text-slate-500 dark:text-slate-600 tracking-widest text-[8.24px] uppercase">RANBIDGE Solutions Private Limited</span>
      </div>
      <div className="space-y-1">
        <p>&copy; 2026 NEC Portal. All rights reserved to RANBIDGE Solutions Private Limited.</p>
      </div>
    </footer>
  );
};

export default Footer;
