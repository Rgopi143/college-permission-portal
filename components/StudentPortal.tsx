
import React, { useState, useEffect } from 'react';
import { RequestType, WorkflowRequest, RequestStatus, User, WorkflowStep, UserRole } from '../types';

interface StudentPortalProps {
  user: User;
  requests: WorkflowRequest[];
  onNewRequest: (req: Partial<WorkflowRequest>) => void;
  showStatusOnly?: boolean;
  initialType?: RequestType;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ user, requests, onNewRequest, showStatusOnly, initialType }) => {
  console.log('StudentPortal showStatusOnly:', showStatusOnly);
  const [activeTab, setActiveTab] = useState<'apply' | 'history'>(showStatusOnly ? 'history' : 'apply');
  const [activeForm, setActiveForm] = useState<RequestType>(initialType || RequestType.PERMISSION);
  const [reason, setReason] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [historyFilter, setHistoryFilter] = useState<string>('all');

  useEffect(() => {
    if (initialType && !showStatusOnly) {
      setActiveForm(initialType);
      setActiveTab('apply');
    }
  }, [initialType, showStatusOnly]);

  useEffect(() => {
    if (showStatusOnly) {
      setActiveTab('history');
    }
  }, [showStatusOnly]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNewRequest({ type: activeForm, reason, arrivalTime, date });
    setReason('');
    setArrivalTime('');
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING: return 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400';
      case RequestStatus.APPROVED: return 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400';
      case RequestStatus.DENIED: return 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400';
      case RequestStatus.GRANTED: return 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const filteredHistory = requests.filter(req => {
    if (historyFilter === 'all') return true;
    return req.status === historyFilter;
  });

  const stats = {
    pending: requests.filter(r => r.status === RequestStatus.PENDING).length,
    completed: requests.filter(r => r.status === RequestStatus.GRANTED).length,
    total: requests.length
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in student-scrollbar-hide">
      {/* Dynamic Header */}
      <div className="bg-slate-900 dark:bg-indigo-950/30 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl transition-all border border-white/5">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
              Student Dashboard
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-none mb-4">
              {user.name.split(' ')[0]}'s Portal
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-sm">
              Track your campus permissions and attendance records in one place.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md flex-1 text-center">
               <p className="text-3xl font-black text-amber-400">{stats.pending}</p>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Requests</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md flex-1 text-center">
               <p className="text-3xl font-black text-emerald-400">{stats.completed}</p>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logs Archived</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-[1.5rem] shadow-sm border border-slate-200 dark:border-slate-800 w-fit mx-auto md:mx-0">
        <button
          onClick={() => setActiveTab('apply')}
          className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'apply' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <i className="fas fa-plus-circle mr-2"></i> New Application
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'history' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <i className="fas fa-list-check mr-2"></i> My Requests
          {requests.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-pulse">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'apply' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <button
              onClick={() => setActiveForm(RequestType.PERMISSION)}
              className={`w-full p-8 rounded-[2.5rem] text-left transition-all border-2 ${
                activeForm === RequestType.PERMISSION ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-xl' : 'bg-transparent border-transparent opacity-60'
              }`}
            >
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mb-6">
                <i className="fas fa-file-signature text-2xl"></i>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Permission</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">Campus exit or event leaves</p>
            </button>
            <button
              onClick={() => setActiveForm(RequestType.LATE_ATTENDANCE)}
              className={`w-full p-8 rounded-[2.5rem] text-left transition-all border-2 ${
                activeForm === RequestType.LATE_ATTENDANCE ? 'bg-white dark:bg-slate-900 border-emerald-500 shadow-xl' : 'bg-transparent border-transparent opacity-60'
              }`}
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mb-6">
                <i className="fas fa-clock text-2xl"></i>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Late Attendance</h3>
              <p className="text-sm text-slate-500 mt-2 font-medium">Log entry after scheduled time</p>
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">
                Submit {activeForm === RequestType.PERMISSION ? 'Permission' : 'Late Arrival'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {activeForm === RequestType.LATE_ATTENDANCE && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Arrival Date</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Time</label>
                      <input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} required className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Reason/Statement</label>
                  <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="Provide clear details for the verification process..." className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none transition-all transform active:scale-95">
                  Confirm Submission
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">
                  My Requests Tracker
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Track your request history and current approval status in real-time
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{filteredHistory.length}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Requests</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', RequestStatus.PENDING, RequestStatus.GRANTED, RequestStatus.DENIED].map(f => (
                <button key={f} onClick={() => setHistoryFilter(f)} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${
                  historyFilter === f 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}>
                  {f === 'all' ? 'All Requests' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {filteredHistory.length > 0 ? filteredHistory.map(req => (
              <div key={req.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-xl transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${req.type === RequestType.PERMISSION ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <i className={`fas ${req.type === RequestType.PERMISSION ? 'fa-file-alt' : 'fa-clock'}`}></i>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>{req.id}</span>
                          <span>•</span>
                          <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">
                          {req.type === RequestType.PERMISSION ? 'Campus Exit Permit' : 'Late Arrival Entry'}
                        </h4>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm italic border-l-4 border-slate-100 dark:border-slate-800 pl-4 py-1">
                      "{req.reason}"
                    </p>
                  </div>

                  <div className="md:w-80 space-y-6">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Current Status</span>
                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase border-2 shadow-sm ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Location</div>
                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-[10px] font-black shadow-lg">
                          <i className="fas fa-map-marker-alt mr-2"></i>
                          {req.currentStep || 'Processing'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Approval Workflow</div>
                      <div className="relative">
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-700"></div>
                        <div className="flex justify-between relative">
                          {[
                            { step: WorkflowStep.MENTOR, icon: 'fa-user-tie', label: 'Mentor' },
                            { step: WorkflowStep.HOD, icon: 'fa-user-graduate', label: 'HOD' },
                            { step: WorkflowStep.SECURITY, icon: 'fa-shield-alt', label: 'Security' }
                          ].map((item, i) => {
                            const isPast = req.logs.some(l => l.role === item.step as any);
                            const isCurrent = req.currentStep === item.step;
                            return (
                              <div key={item.step} className="flex flex-col items-center group/step">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[8px] font-bold z-10 border-2 transition-all ${
                                  isPast ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-indigo-500 text-white shadow-lg' : 
                                  isCurrent ? 'bg-white dark:bg-slate-900 border-indigo-500 text-indigo-500 animate-pulse shadow-lg shadow-indigo-500/25' : 
                                  'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                                }`}>
                                  <i className={`fas ${item.icon} text-xs`}></i>
                                </div>
                                <span className="mt-2 text-[8px] font-black uppercase text-slate-500">{item.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Verification Audit Trail</h5>
                  <div className="flex flex-wrap gap-4">
                    {req.logs.map((log, i) => (
                      <div key={i} className="flex items-center bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700/30">
                        <div className={`w-2 h-2 rounded-full mr-3 ${log.action === 'APPROVE' || log.action === 'GRANT' ? 'bg-emerald-500' : log.action === 'DENY' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-900 dark:text-slate-200 leading-none mb-1">{log.userName}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                            {log.role} • {log.action} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <i className="fas fa-inbox text-4xl text-slate-200 mb-4"></i>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No entries found for this category</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
