import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs neu-flat border-t border-transparent transition-colors mt-auto">
      <div className="flex items-center justify-center space-x-3 mb-2">
        <div className="p-1.5 neu-logo-box dark:bg-white rounded-xl" data-logo-box="company">
          <img src="/RANBIDGE-Solutions-PVT-LTD-Logo.png" alt="RANBIDGE Solutions Private Limited Logo" className="h-10 w-auto object-contain" />
        </div>
        <span className="font-bold tracking-widest text-[9px] uppercase">RANBIDGE Solutions Private Limited</span>
      </div>
      <p>&copy; 2026 NEC Portal. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
