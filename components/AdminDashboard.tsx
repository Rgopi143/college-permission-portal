
import React from 'react';
import { WorkflowRequest, RequestStatus, WorkflowStep } from '../types';

interface AdminDashboardProps {
  requests: WorkflowRequest[];
  insight: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests, insight }) => {
  const stats = {
    total: requests.length,
    approved: requests.filter(r => r.status === RequestStatus.APPROVED || r.status === RequestStatus.GRANTED).length,
    pending: requests.filter(r => r.status === RequestStatus.PENDING).length,
    denied: requests.filter(r => r.status === RequestStatus.DENIED).length,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Neumorphic Live Monitor Header */}
      <div className="neu-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="z-10 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 neu-pill-inset text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            System Live Monitor
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-800 dark:text-white leading-tight">
            Global Control
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium text-sm md:text-base leading-relaxed">
            Cross-departmental monitoring of all college-wide workflow clearances.
          </p>
        </div>
        <div className="flex gap-4 z-10 relative">
          <div className="neu-inset-sm p-6 rounded-3xl w-36 text-center">
            <p className="text-3xl md:text-4xl font-black mb-1 text-slate-800 dark:text-white">{stats.total}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">All Logs</p>
          </div>
          <div className="neu-inset-sm p-6 rounded-3xl w-36 text-center">
            <p className="text-3xl md:text-4xl font-black text-emerald-500 dark:text-emerald-400 mb-1">{stats.approved}</p>
            <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-black uppercase tracking-[0.2em]">Verified</p>
          </div>
        </div>
      </div>

      {/* AI Intelligent Trends */}
      <div className="neu-card p-6 md:p-8 relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-5">
           <div className="w-10 h-10 neu-flat-sm text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
             <i className="fas fa-brain text-base"></i>
           </div>
           <div>
             <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-xs">
               Gemini Intelligent Insights
             </h3>
             <span className="text-[10px] text-slate-400 font-bold">Automated Trend Analysis</span>
           </div>
        </div>
        <div className="neu-inset p-5 rounded-2xl">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-sm italic">
            "{insight || "Synthesizing latest approval patterns to generate executive insights..."}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real-time Stream */}
        <div className="neu-card p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-xs">
              Real-time Stream
            </h3>
            <span className="neu-pill-inset text-[10px] text-emerald-500 font-black">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse inline-block"></span>
              Live Feed
            </span>
          </div>
          <div className="space-y-4">
            {requests.slice(0, 5).map((req, idx) => (
              <div key={idx} className="neu-inset-sm p-4 rounded-2xl flex items-center justify-between group">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 neu-flat-sm rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    <i className="fas fa-user text-xs"></i>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {req.studentName} <span className="text-slate-400 font-normal">requested</span> {req.type.replace('_', ' ')}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="neu-pill-inset text-[9px] font-extrabold text-indigo-600 dark:text-indigo-400">At {req.currentStep}</span>
                      <span className="text-[10px] text-slate-400 font-medium">• {req.status}</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase whitespace-nowrap pl-2">Recent</p>
              </div>
            ))}
          </div>
        </div>

        {/* Departmental Saturation */}
        <div className="neu-card p-6 md:p-8">
          <h3 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider text-xs mb-8">
            Departmental Saturation
          </h3>
          <div className="space-y-6">
             {Object.values(WorkflowStep).map(step => {
               const count = requests.filter(r => r.currentStep === step).length;
               const pct = Math.round((count / (requests.length || 1)) * 100);
               return (
                 <div key={step}>
                   <div className="flex justify-between items-end mb-2">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing Node</span>
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{step}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 mr-1">{count}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">({pct}%)</span>
                      </div>
                   </div>
                   <div className="h-3 neu-inset-sm rounded-full overflow-hidden p-0.5">
                      <div className={`h-full rounded-full transition-all duration-1000 ${step === WorkflowStep.COMPLETED ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`} style={{ width: `${Math.max(pct, 5)}%` }}></div>
                   </div>
                 </div>
               );
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
