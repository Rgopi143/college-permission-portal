
import React, { useState } from 'react';
import { User, WorkflowRequest, UserRole, RequestStatus, WorkflowStep } from '../types';

interface ApprovalDashboardProps {
  user: User;
  requests: WorkflowRequest[];
  onAction: (id: string, action: 'APPROVE' | 'DENY' | 'GRANT') => void;
}

const ApprovalDashboard: React.FC<ApprovalDashboardProps> = ({ user, requests, onAction }) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [filter, setFilter] = useState<string>('all');

  // Requests specifically waiting for the CURRENT user's role
  const pendingForMe = requests.filter(req => {
    if (req.status === RequestStatus.DENIED) return false;
    if (user.role === UserRole.MENTOR) return req.currentStep === WorkflowStep.MENTOR;
    if (user.role === UserRole.HOD) return req.currentStep === WorkflowStep.HOD;
    if (user.role === UserRole.SECURITY) return req.currentStep === WorkflowStep.SECURITY;
    return false;
  });

  // Requests that the CURRENT user has already verified (Stored individually in logs)
  const myVerifiedHistory = requests.filter(req => 
    req.logs.some(log => log.userName === user.name && log.role === user.role)
  );

  const displayList = activeTab === 'queue' ? pendingForMe : myVerifiedHistory;
  
  const filteredList = displayList.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  // Calculate real-time stats
  const stats = {
    todo: pendingForMe.length,
    done: myVerifiedHistory.length,
    globalActive: requests.filter(r => r.status === RequestStatus.PENDING || r.status === RequestStatus.APPROVED).length,
    globalComplete: requests.filter(r => r.status === RequestStatus.GRANTED).length
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {user.role} <span className="text-indigo-600 dark:text-indigo-400">Verification</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Managing {user.branch || 'Departmental'} clearance queue and audit compliance.
          </p>
        </div>
        
        <div className="neu-tabs-bar">
          <button
            onClick={() => setActiveTab('queue')}
            className={`neu-tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          >
            <i className="fas fa-layer-group mr-2"></i> Active Queue ({stats.todo})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`neu-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          >
            <i className="fas fa-clipboard-check mr-2"></i> My Decisions ({stats.done})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'My Action List', val: stats.todo, color: 'text-indigo-600 dark:text-indigo-400', icon: 'fa-hourglass-half' },
          { label: 'My Total Verified', val: stats.done, color: 'text-emerald-600 dark:text-emerald-400', icon: 'fa-check-circle' },
          { label: 'Total In-Flow', val: stats.globalActive, color: 'text-amber-500 dark:text-amber-400', icon: 'fa-rotate' },
          { label: 'Total Verified', val: stats.globalComplete, color: 'text-blue-500 dark:text-blue-400', icon: 'fa-database' }
        ].map((s, i) => (
          <div key={i} className="neu-stat-box">
             <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">{s.label}</p>
             <div className="flex items-center justify-between">
                <span className={`text-3xl font-black ${s.color}`}>{s.val}</span>
                <div className="w-10 h-10 neu-flat-sm rounded-xl flex items-center justify-center text-slate-500">
                  <i className={`fas ${s.icon} text-base`}></i>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="neu-card overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-300/30 dark:border-slate-800/80 flex justify-between items-center">
          <h3 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-xs flex items-center">
            <i className="fas fa-fingerprint mr-2.5 text-indigo-500 text-sm"></i>
            {activeTab === 'queue' ? 'Requests Requiring Your Verification' : 'Your Individual Verification Log'}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-300/20 dark:border-slate-800/50">
                <th className="px-6 md:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Applicant</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Context / Reason</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current State</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/50">
              {filteredList.length > 0 ? filteredList.map(req => (
                <tr key={req.id} className="hover:bg-slate-200/30 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 md:px-8 py-5">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-2xl neu-flat-sm flex items-center justify-center overflow-hidden p-0.5">
                        <img src={`https://picsum.photos/seed/${req.rollNo}/100`} alt="" className="w-full h-full rounded-xl object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{req.studentName}</p>
                        <p className="text-xs text-slate-400 font-medium">{req.rollNo} • {req.branch}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-5 max-w-xs">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium italic line-clamp-1">"{req.reason}"</p>
                    <span className="neu-pill-inset text-[9px] text-slate-500 mt-1 uppercase font-extrabold inline-block">
                      {req.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 md:px-8 py-5">
                    <div className="inline-flex items-center space-x-2 neu-pill-inset text-[10px] font-bold">
                      <div className={`w-2 h-2 rounded-full ${req.status === RequestStatus.DENIED ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                      <span className="uppercase tracking-widest text-slate-600 dark:text-slate-300">@ {req.currentStep}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-5 text-right">
                    {activeTab === 'queue' ? (
                      <div className="flex items-center justify-end space-x-2.5">
                        <button
                          onClick={() => onAction(req.id, 'DENY')}
                          className="neu-btn text-rose-500 hover:text-rose-600 py-2 px-3.5 text-xs font-bold rounded-xl"
                        >
                          <i className="fas fa-times mr-1.5"></i>
                          Deny
                        </button>
                        {user.role === UserRole.SECURITY ? (
                          <button
                            onClick={() => onAction(req.id, 'GRANT')}
                            className="neu-btn-emerald py-2 px-4 text-xs font-bold rounded-xl"
                          >
                            <i className="fas fa-check-double mr-1.5"></i>
                            Grant Pass
                          </button>
                        ) : (
                          <button
                            onClick={() => onAction(req.id, 'APPROVE')}
                            className="neu-btn-primary py-2 px-4 text-xs font-bold rounded-xl"
                          >
                            <i className="fas fa-check mr-1.5"></i>
                            Approve
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className={`neu-pill text-[10px] uppercase font-bold ${
                        req.status === RequestStatus.GRANTED || req.status === RequestStatus.APPROVED
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : req.status === RequestStatus.DENIED
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {req.status}
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 text-sm">
                    <i className="fas fa-check-circle text-2xl mb-2 text-indigo-400 block"></i>
                    No requests pending in this queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDashboard;

