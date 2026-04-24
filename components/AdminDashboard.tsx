
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
      <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden transition-colors border border-slate-800">
        <div className="z-10 relative">
          <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4 backdrop-blur-sm">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
            System Live Monitor
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Global Control</h1>
          <p className="text-slate-400 mt-4 max-w-sm font-medium text-lg leading-relaxed">Cross-departmental monitoring of all college-wide workflow clearances.</p>
        </div>
        <div className="flex gap-4 z-10 relative">
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 w-40 text-center flex flex-col justify-center transition-transform hover:scale-105">
            <p className="text-4xl font-black mb-1">{stats.total}</p>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">All Logs</p>
          </div>
          <div className="bg-emerald-500/10 backdrop-blur-xl p-8 rounded-[2rem] border border-emerald-500/20 w-40 text-center flex flex-col justify-center transition-transform hover:scale-105">
            <p className="text-4xl font-black text-emerald-400 mb-1">{stats.approved}</p>
            <p className="text-[10px] text-emerald-500/50 font-black uppercase tracking-[0.2em]">Verified</p>
          </div>
        </div>
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-24 -top-24 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
        <div className="flex items-center space-x-3 mb-6">
           <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none">
             <i className="fas fa-brain text-sm"></i>
           </div>
           <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Gemini Intelligent Trends</h3>
        </div>
        <div className="relative z-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
            {insight || "Synthesizing latest approval patterns to generate executive insights..."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 transition-colors">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">Real-time Stream</h3>
            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-200"></span>
          </div>
          <div className="space-y-8">
            {requests.slice(0, 5).map((req, idx) => (
              <div key={idx} className="flex items-start space-x-5 group">
                <div className="mt-1 flex flex-col items-center">
                   <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-indigo-500 shadow-md shadow-indigo-200' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                   {idx < 4 && <div className="w-0.5 h-10 bg-slate-50 dark:bg-slate-800 mt-2"></div>}
                </div>
                <div className="flex-1 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl border border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-800 transition-all">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {req.studentName} <span className="text-slate-400 font-medium">triggered</span> {req.type.replace('_', ' ')}
                  </p>
                  <div className="flex items-center space-x-3 mt-1.5">
                     <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">At {req.currentStep}</span>
                     <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">• {req.status}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 font-black uppercase whitespace-nowrap pt-5">Just Now</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 transition-colors">
          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm mb-10">Departmental Saturation</h3>
          <div className="space-y-10">
             {Object.values(WorkflowStep).map(step => {
               const count = requests.filter(r => r.currentStep === step).length;
               const pct = (count / (requests.length || 1)) * 100;
               return (
                 <div key={step}>
                   <div className="flex justify-between items-end mb-3">
                      <div>
                        <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Processing Node</span>
                        <h4 className="text-sm font-black text-slate-900 dark:text-slate-200">{step}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{count}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 block uppercase">Active Cases</span>
                      </div>
                   </div>
                   <div className="h-4 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
                      <div className={`h-full rounded-full transition-all duration-1000 ${step === WorkflowStep.COMPLETED ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }}></div>
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
