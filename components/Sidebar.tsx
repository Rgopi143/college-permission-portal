
import React from 'react';
import { User, UserRole } from '../types';

interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange, isOpen, onClose }) => {
  const getNavItems = () => {
    const items = [{ id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high' }];
    
    // Add Creative Studio for all users
    items.push({ id: 'creative', label: 'Creative Studio', icon: 'fa-wand-magic-sparkles' });

    if (user.role === UserRole.STUDENT) {
      items.push({ id: 'status', label: 'My Requests', icon: 'fa-list-check' });
      items.push({ id: 'complaints', label: 'Complaints', icon: 'fa-comment-dots' });
      items.push({ id: 'syllabus', label: 'Syllabus Material', icon: 'fa-book-open' });
    }
    
    if (user.role === UserRole.HOD) {
      items.push({ id: 'students', label: 'Manage Students', icon: 'fa-users' });
    }
    
    if (user.role === UserRole.ADMIN) {
      items.push({ id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' });
    }
    
    return items;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed lg:relative w-64 bg-[#e4ebf5] dark:bg-[#13161f] text-slate-800 dark:text-slate-100 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out transform neu-flat z-50 h-screen lg:h-auto border-r border-transparent ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-slate-300/40 dark:border-slate-800/80 flex items-center">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 neu-flat-sm rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <i className="fas fa-graduation-cap text-xl"></i>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-800 dark:text-white block leading-none">
                CollegeFlow
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">NEC Portal</span>
            </div>
          </div>
        </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-2.5">
        {getNavItems().map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                console.log('Sidebar clicked:', item.id);
                onTabChange(item.id);
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }}
              className={`w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                isActive
                  ? item.id === 'creative'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 neu-flat-sm'
                    : 'neu-inset text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:neu-flat-sm'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isActive 
                  ? (item.id === 'creative' ? 'bg-white/20 text-white' : 'neu-flat-sm text-indigo-600 dark:text-indigo-400') 
                  : 'text-slate-500'
              }`}>
                <i className={`fas ${item.icon} text-sm ${isActive && item.id === 'creative' ? 'animate-pulse' : ''}`}></i>
              </div>
              <span className="font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>

        {/* Feedback Button */}
        <div className="px-4 mb-6">
          <button
            onClick={() => {
              alert('Feedback feature coming soon! Thank you for your input.');
            }}
            className="w-full neu-btn-emerald py-3 px-4 text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2"
          >
            <i className="fas fa-comment-dots text-sm"></i>
            <span className="font-bold">Feedback</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
