
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
      
      <aside className={`fixed lg:relative w-64 bg-slate-900 dark:bg-black text-white flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out transform border-r border-slate-800/50 z-50 h-screen lg:h-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-slate-800 flex items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/20">
              <i className="fas fa-graduation-cap text-xl"></i>
            </div>
            <span className="text-xl font-bold tracking-tight">CollegeFlow</span>
          </div>
        </div>
      
      <nav className="flex-1 mt-6 px-4 space-y-1">
        {getNavItems().map(item => (
          <button
            key={item.id}
            onClick={() => {
              console.log('Sidebar clicked:', item.id);
              onTabChange(item.id);
              // Auto-close sidebar after navigation (only on mobile)
              if (window.innerWidth < 1024) {
                onClose();
              }
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id 
                ? (item.id === 'creative' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-900/40 shadow-lg text-white' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20')
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center ${activeTab === item.id && item.id === 'creative' ? 'animate-pulse' : ''}`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

          </aside>
    </>
  );
};

export default Sidebar;
