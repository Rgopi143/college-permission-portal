
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {user.role} <span className="text-indigo-600">Verification</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
            Managing {user.branch || 'Departmental'} flow and audit compliance.
          </p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'queue' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fas fa-layer-group mr-2"></i> Active Queue ({stats.todo})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <i className="fas fa-clipboard-check mr-2"></i> My Decisions ({stats.done})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'My Action List', val: stats.todo, color: 'text-indigo-600', icon: 'fa-hourglass-half' },
          { label: 'My Total Verified', val: stats.done, color: 'text-emerald-600', icon: 'fa-check-circle' },
          { label: 'Total In-Flow', val: stats.globalActive, color: 'text-amber-600', icon: 'fa-rotate' },
          { label: 'Total Verified', val: stats.globalComplete, color: 'text-blue-600', icon: 'fa-database' }
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-indigo-200 transition-all">
             <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">{s.label}</p>
             <div className="flex items-center justify-between">
                <span className={`text-3xl font-black ${s.color}`}>{s.val}</span>
                <i className={`fas ${s.icon} text-slate-200 dark:text-slate-800 text-xl group-hover:scale-110 transition-transform`}></i>
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest text-sm flex items-center">
            <i className="fas fa-fingerprint mr-3 text-indigo-500"></i>
            {activeTab === 'queue' ? 'Requests Requiring Your Signature' : 'Your Individual Verification Log'}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/20 dark:bg-slate-800/10">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Applicant</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Context / Reason</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current State</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.length > 0 ? filteredList.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden">
                        <img src={`https://picsum.photos/seed/${req.rollNo}/100`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{req.studentName}</p>
                        <p className="text-xs text-slate-400 font-medium">{req.rollNo} • {req.branch}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-xs">
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium italic line-clamp-1">"{req.reason}"</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-black uppercase">{req.type.replace('_', ' ')}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${req.status === RequestStatus.DENIED ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">@ {req.currentStep}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {activeTab === 'queue' ? (
                      <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => onAction(req.id, 'DENY')}
                          className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-950/20 rounded-xl hover:bg-rose-100 transition-all"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => onAction(req.id, user.role === UserRole.SECURITY ? 'GRANT' : 'APPROVE')}
                          className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all"
                        >
                          {user.role === UserRole.SECURITY ? 'Grant Exit' : 'Sign Off'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end">
                        <span className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/30">
                          <i className="fas fa-check-double mr-2"></i>
                          Decision Recorded
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200 dark:text-slate-700">
                      <i className={`fas ${activeTab === 'queue' ? 'fa-check-circle' : 'fa-folder-open'} text-3xl`}></i>
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-black text-xl">
                      {activeTab === 'queue' ? 'Queue is Clear' : 'No History Logged'}
                    </h3>
                    <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto font-medium">
                      {activeTab === 'queue' ? 'There are no student requests waiting for your verification.' : 'Start verifying requests to build your decision history.'}
                    </p>
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
