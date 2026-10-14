
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
      {/* Dynamic Neumorphic Header */}
      <div className="neu-card p-8 md:p-10 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 neu-pill-inset text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-3">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              Student Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800 dark:text-white mb-2">
              {user.name.split(' ')[0]}'s Portal
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-medium max-w-sm">
              Track your campus permissions and attendance records in one tactile workspace.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="neu-inset-sm p-5 rounded-2xl flex-1 text-center">
               <p className="text-3xl font-black text-amber-500 dark:text-amber-400">{stats.pending}</p>
               <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">Active Requests</p>
            </div>
            <div className="neu-inset-sm p-5 rounded-2xl flex-1 text-center">
               <p className="text-3xl font-black text-emerald-500 dark:text-emerald-400">{stats.completed}</p>
               <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-1">Logs Archived</p>
            </div>
          </div>
        </div>
      </div>

      {/* Neumorphic Tabs */}
      <div className="neu-tabs-bar w-fit mx-auto md:mx-0">
        <button
          onClick={() => setActiveTab('apply')}
          className={`neu-tab-btn ${activeTab === 'apply' ? 'active' : ''}`}
        >
          <i className="fas fa-plus-circle mr-2"></i> New Application
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`neu-tab-btn relative ${activeTab === 'history' ? 'active' : ''}`}
        >
          <i className="fas fa-list-check mr-2"></i> My Requests
          {requests.length > 0 && (
            <span className="ml-2 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
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
              className={`w-full p-6 md:p-8 rounded-[2rem] text-left transition-all ${
                activeForm === RequestType.PERMISSION ? 'neu-inset border border-indigo-500/40' : 'neu-card-interactive opacity-80'
              }`}
            >
              <div className="w-14 h-14 neu-flat-sm text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                <i className="fas fa-file-signature text-2xl"></i>
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white">Permission</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Campus exit or event leaves</p>
            </button>
            <button
              onClick={() => setActiveForm(RequestType.LATE_ATTENDANCE)}
              className={`w-full p-6 md:p-8 rounded-[2rem] text-left transition-all ${
                activeForm === RequestType.LATE_ATTENDANCE ? 'neu-inset border border-emerald-500/40' : 'neu-card-interactive opacity-80'
              }`}
            >
              <div className="w-14 h-14 neu-flat-sm text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-4">
                <i className="fas fa-clock text-2xl"></i>
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white">Late Attendance</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Log entry after scheduled time</p>
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="neu-card p-8 md:p-10">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6">
                Submit {activeForm === RequestType.PERMISSION ? 'Permission' : 'Late Arrival'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {activeForm === RequestType.LATE_ATTENDANCE && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Arrival Date</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="neu-input" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Time</label>
                      <input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} required className="neu-input" />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Reason / Statement</label>
                  <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="Provide clear details for the verification process..." className="neu-textarea resize-none" />
                </div>
                <button type="submit" className="neu-btn-primary w-full py-4 text-xs uppercase tracking-wider">
                  <i className="fas fa-paper-plane mr-2"></i>
                  Confirm Submission
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="neu-card p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-1">
                  My Requests Tracker
                </h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Track your request history and current approval status in real-time
                </p>
              </div>
              <div className="neu-inset-sm px-5 py-3 rounded-2xl text-center sm:text-right w-fit">
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{filteredHistory.length}</div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Requests</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', RequestStatus.PENDING, RequestStatus.GRANTED, RequestStatus.DENIED].map(f => (
                <button key={f} onClick={() => setHistoryFilter(f)} className={`neu-tab-btn ${
                  historyFilter === f ? 'active text-indigo-600 font-bold' : ''
                }`}>
                  {f === 'all' ? 'All Requests' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {filteredHistory.length > 0 ? filteredHistory.map(req => (
              <div key={req.id} className="neu-card p-6 md:p-8 transition-all hover:scale-[1.005]">
                <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 neu-flat-sm rounded-2xl flex items-center justify-center ${req.type === RequestType.PERMISSION ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        <i className={`fas ${req.type === RequestType.PERMISSION ? 'fa-file-alt' : 'fa-clock'} text-lg`}></i>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                          <span>{req.id}</span>
                          <span>•</span>
                          <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-800 dark:text-white">
                          {req.type === RequestType.PERMISSION ? 'Campus Exit Permit' : 'Late Arrival Entry'}
                        </h4>
                      </div>
                    </div>
                    <div className="neu-inset-sm p-4 rounded-2xl">
                      <p className="text-slate-600 dark:text-slate-300 text-sm font-medium italic">
                        "{req.reason}"
                      </p>
                    </div>
                  </div>

                  <div className="md:w-80 space-y-4">
                    <div className="neu-inset-sm p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Current Status</span>
                        <span className={`neu-pill text-[10px] uppercase font-black ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Checkpoint</div>
                        <div className="inline-flex items-center px-3.5 py-1.5 neu-flat-sm text-indigo-600 dark:text-indigo-400 rounded-full text-[11px] font-extrabold">
                          <i className="fas fa-map-marker-alt mr-2 text-indigo-500"></i>
                          {req.currentStep || 'Processing'}
                        </div>
                      </div>
                    </div>

                    <div className="neu-flat-sm p-4 rounded-2xl">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Approval Progress</div>
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
