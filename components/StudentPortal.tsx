import React, { useState, useEffect } from 'react';
import { RequestType, WorkflowRequest, RequestStatus, User, WorkflowStep, UserRole } from '../types';

interface StudentPortalProps {
  user: User;
  requests: WorkflowRequest[];
  onNewRequest: (req: Partial<WorkflowRequest>) => void;
  showStatusOnly?: boolean;
  initialType?: RequestType;
}

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  icon: string;
  badgeClass: string;
  timestamp: number;
}

const StudentPortal: React.FC<StudentPortalProps> = ({ 
  user, 
  requests, 
  onNewRequest, 
  showStatusOnly, 
  initialType 
}) => {
  // Modal states for the 9 services
  type ServiceModalType = 
    | 'outpass' 
    | 'certificate' 
    | 'stationery' 
    | 'printout' 
    | 'canteen' 
    | 'track' 
    | 'help' 
    | 'timetable' 
    | 'events' 
    | null;

  const [activeModal, setActiveModal] = useState<ServiceModalType>(showStatusOnly ? 'track' : null);

  // Outpass form state
  const [outpassReason, setOutpassReason] = useState('');
  const [outpassDate, setOutpassDate] = useState(new Date().toISOString().split('T')[0]);
  const [outpassDepartureTime, setOutpassDepartureTime] = useState('');
  const [outpassArrivalTime, setOutpassArrivalTime] = useState('');
  const [outpassType, setOutpassType] = useState<RequestType>(initialType || RequestType.PERMISSION);
  const [parentPhone, setParentPhone] = useState(user.emergency_contact_phone || '+91 98765 43210');

  // Certificate form state
  const [certType, setCertType] = useState('Bonafide Certificate');
  const [certPurpose, setCertPurpose] = useState('');

  // Stationery Store state
  const [stationeryQty, setStationeryQty] = useState<{ [key: string]: number }>({
    'pen-blue': 1,
    'pen-black': 1,
    'sheets': 1,
    'record': 1
  });

  // Printout Center state
  const [printFileName, setPrintFileName] = useState('');
  const [printColor, setPrintColor] = useState<'bw' | 'color'>('bw');
  const [printCopies, setPrintCopies] = useState(1);
  const [printDoubleSided, setPrintDoubleSided] = useState(true);

  // Canteen Token state
  const [selectedCanteenItem, setSelectedCanteenItem] = useState('South Indian Veg Thali - ₹70');
  const [canteenTimeSlot, setCanteenTimeSlot] = useState('12:45 PM - 01:15 PM');
  const [activeCanteenToken, setActiveCanteenToken] = useState<string | null>(null);

  // History filter
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Latest activity list initialized with the exact item from screenshot:
  // "Store Item: Standard Gel Pen (Blu... Qty: 1 units [PENDING]"
  const [activityList, setActivityList] = useState<ActivityItem[]>(() => {
    const saved = localStorage.getItem(`collegeflow_activity_${user.id}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      {
        id: 'act-init-1',
        title: 'Store Item: Standard Gel Pen (Blue)',
        subtitle: 'Qty: 1 units',
        status: 'PENDING',
        icon: 'fa-box',
        badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        timestamp: Date.now() - 3600000
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem(`collegeflow_activity_${user.id}`, JSON.stringify(activityList));
  }, [activityList, user.id]);

  useEffect(() => {
    if (showStatusOnly) {
      setActiveModal('track');
    }
  }, [showStatusOnly]);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Submit Outpass
  const handleOutpassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outpassReason.trim()) return;

    onNewRequest({
      type: outpassType,
      reason: outpassReason,
      arrivalTime: outpassArrivalTime || outpassDepartureTime,
      date: outpassDate,
    });

    const newActivity: ActivityItem = {
      id: `outpass-${Date.now()}`,
      title: outpassType === RequestType.PERMISSION ? 'Outpass: Campus Leave' : 'Attendance: Late Entry',
      subtitle: `Date: ${outpassDate} • ${outpassDepartureTime || 'Immediate'}`,
      status: 'PENDING',
      icon: 'fa-running',
      badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      timestamp: Date.now()
    };

    setActivityList(prev => [newActivity, ...prev]);
    setOutpassReason('');
    setActiveModal(null);
    showNotification('Outpass request submitted successfully! Awaiting mentor approval.');
  };

  // Submit Certificate request
  const handleCertificateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certPurpose.trim()) return;

    const newActivity: ActivityItem = {
      id: `cert-${Date.now()}`,
      title: `Certificate: ${certType}`,
      subtitle: `Purpose: ${certPurpose}`,
      status: 'PENDING',
      icon: 'fa-file-certificate',
      badgeClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      timestamp: Date.now()
    };

    setActivityList(prev => [newActivity, ...prev]);
    setCertPurpose('');
    setActiveModal(null);
    showNotification(`${certType} requested successfully! Forwarded to Examination Section.`);
  };

  // Order Stationery Item
  const handleOrderStationery = (itemTitle: string, qty: number) => {
    const newActivity: ActivityItem = {
      id: `store-${Date.now()}`,
      title: `Store Item: ${itemTitle}`,
      subtitle: `Qty: ${qty} units`,
      status: 'PENDING',
      icon: 'fa-box',
      badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      timestamp: Date.now()
    };

    setActivityList(prev => [newActivity, ...prev]);
    setActiveModal(null);
    showNotification(`Order placed for ${itemTitle}! Collect from Campus Store counter.`);
  };

  // Submit Print Order
  const handlePrintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `PRN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newActivity: ActivityItem = {
      id: `print-${Date.now()}`,
      title: `Printout: ${printFileName || 'Document.pdf'} (${printColor.toUpperCase()})`,
      subtitle: `Token: ${token} • ${printCopies} copies`,
      status: 'QUEUED',
      icon: 'fa-print',
      badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      timestamp: Date.now()
    };

    setActivityList(prev => [newActivity, ...prev]);
    setPrintFileName('');
    setActiveModal(null);
    showNotification(`Print job queued! Token: ${token}. Collect at Xerox counter.`);
  };

  // Order Canteen Token
  const handleCanteenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `CAN-${Math.floor(100 + Math.random() * 900)}`;
    setActiveCanteenToken(token);
    const newActivity: ActivityItem = {
      id: `canteen-${Date.now()}`,
      title: `Canteen: ${selectedCanteenItem}`,
      subtitle: `Token: ${token} • Slot: ${canteenTimeSlot}`,
      status: 'CONFIRMED',
      icon: 'fa-utensils',
      badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      timestamp: Date.now()
    };

    setActivityList(prev => [newActivity, ...prev]);
    setActiveModal(null);
    showNotification(`Canteen token generated! Token: ${token} for slot ${canteenTimeSlot}.`);
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (historyFilter === 'all') return true;
    return req.status === historyFilter;
  });

  // Calculate active/pending vs total cleared stats
  const pendingCount = requests.filter(r => r.status === RequestStatus.PENDING || r.status === RequestStatus.APPROVED).length;
  const clearedCount = requests.filter(r => r.status === RequestStatus.GRANTED).length;

  // Active outpass request to highlight in Campus Outpass Hub
  const activeOutpass = requests.find(r => r.status === RequestStatus.PENDING || r.status === RequestStatus.APPROVED);

  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in relative px-1 sm:px-2">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 neu-card bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500/40 p-4 rounded-2xl flex items-center space-x-3 shadow-2xl animate-fade-in max-w-sm">
          <i className="fas fa-check-circle text-emerald-600 text-lg"></i>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
            {successToast}
          </span>
        </div>
      )}

      {/* 1. Header Greeting Section */}
      <div className="pt-2">
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Welcome back,</p>
        <h1 className="text-2xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight mt-0.5">
          {user.name || 'R Gopinath Reddy'}
        </h1>
        <p className="text-teal-600 dark:text-teal-400 text-xs sm:text-sm font-bold tracking-wide mt-1">
          {user.studentId || user.id || '23471A4245'} • {user.branch || 'Computer Science (Emerging Technologies)'}
        </p>
      </div>

      {/* 2. Banner Card ("NEC Narasaraopeta Portal") */}
      <div className="rounded-3xl overflow-hidden neu-card relative p-0 border border-slate-200/50 dark:border-slate-800/80 shadow-md">
        <div className="relative w-full h-36 sm:h-44 bg-gradient-to-r from-[#211538] via-[#2d1b4a] to-[#1c1333] flex items-center justify-between px-6 sm:px-10 overflow-hidden">
          {/* Subtle logo pattern in background */}
          <div 
            className="absolute inset-0 opacity-15 dark:opacity-25 bg-contain bg-center bg-no-repeat pointer-events-none transform scale-125"
            style={{ backgroundImage: 'url(/nec-logo.png)' }}
          />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide drop-shadow-md">
              NEC Narasaraopeta Portal
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/80 font-medium mt-1">
              Autonomous Engineering Institution • Campus Clearances
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-white text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Student Clearance System
            </div>
          </div>
          <div className="hidden sm:flex p-3 neu-logo-box dark:bg-white rounded-2xl shadow-xl z-10" data-logo-box="nec">
            <img src="/nec-logo.png" alt="NEC Logo" className="w-16 h-16 object-contain" />
          </div>
        </div>
      </div>

      {/* 3. Campus Outpass Hub Card */}
      <div className="neu-card p-5 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center neu-inset-sm">
              <i className="fas fa-running text-lg"></i>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                Campus Outpass Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Manage and request exit permissions
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('outpass')}
            className="w-10 h-10 neu-icon-btn text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform flex items-center justify-center"
            title="Request Outpass"
          >
            <i className="fas fa-plus text-base"></i>
          </button>
        </div>

        <div className="pt-2">
          <div className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
            ACTIVE REQUESTS
          </div>

          {activeOutpass ? (
            <div className="neu-inset-sm p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    {activeOutpass.status}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {activeOutpass.type === RequestType.PERMISSION ? 'Campus Exit Permit' : 'Late Arrival Entry'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  "{activeOutpass.reason}"
                </p>
                <p className="text-[10px] text-slate-400">
                  Current Checkpoint: <strong className="text-indigo-500">{activeOutpass.currentStep}</strong>
                </p>
              </div>
              <button
                onClick={() => setActiveModal('track')}
                className="neu-btn-primary px-3 py-1.5 text-[11px] font-black uppercase rounded-xl"
              >
                Track Status
              </button>
            </div>
          ) : (
            <div className="neu-inset-sm p-6 rounded-2xl text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
                <i className="fas fa-info text-sm"></i>
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                No active outpass requests
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Need to leave campus? Submit a request below.
              </p>
              <button
                onClick={() => setActiveModal('outpass')}
                className="mt-3 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Apply for Permission <i className="fas fa-arrow-right text-[10px]"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. My Requests & History Card */}
      <div className="neu-card p-5 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center neu-inset-sm">
              <i className="fas fa-compact-disc text-lg"></i>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white">
                My Requests & History
              </h3>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('track')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            View History <i className="fas fa-chevron-right text-[10px]"></i>
          </button>
        </div>

        {/* 2 Stat summary boxes */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
          {/* Active/Pending Box */}
          <div className="p-4 rounded-2xl bg-[#eef4ff] dark:bg-[#1a2333] border border-indigo-100 dark:border-indigo-950/60 neu-flat-sm">
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Active/Pending</p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
              {pendingCount || (activityList.filter(a => a.status === 'PENDING').length > 0 ? 1 : 0)} Open
            </p>
          </div>

          {/* Total Cleared Box */}
          <div className="p-4 rounded-2xl bg-[#edfdf8] dark:bg-[#132d29] border border-teal-100 dark:border-teal-950/60 neu-flat-sm">
            <p className="text-xs font-bold text-teal-600 dark:text-teal-400">Total Cleared</p>
            <p className="text-2xl sm:text-3xl font-black text-teal-700 dark:text-teal-300 mt-1">
              {clearedCount} Done
            </p>
          </div>
        </div>

        {/* LATEST ACTIVITY */}
        <div className="pt-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            LATEST ACTIVITY
          </div>

          <div className="space-y-2">
            {activityList.slice(0, 3).map((act) => (
              <div 
                key={act.id} 
                className="neu-inset-sm p-3.5 rounded-2xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs flex-shrink-0">
                    <i className={`fas ${act.icon}`}></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {act.subtitle}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ml-2 ${act.badgeClass}`}>
                  {act.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Services Directory Header & 2-Column Grid of 9 Cards */}
      <div className="pt-2">
        <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white mb-3 tracking-tight">
          Services Directory
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* 1. Outpass Clearance */}
          <button
            onClick={() => setActiveModal('outpass')}
            className="p-4 sm:p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#eef2ff] dark:bg-[#1a1f36] border border-indigo-100/90 dark:border-indigo-900/40 neu-card-interactive"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 text-lg">
              <i className="fas fa-running"></i>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">
              Outpass Clearance
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Campus leave permission
            </p>
          </button>

          {/* 2. Certificate Hub */}
          <button
            onClick={() => setActiveModal('certificate')}
            className="p-4 sm:p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#f0fdfa] dark:bg-[#112d2c] border border-teal-100/90 dark:border-teal-900/40 neu-card-interactive"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 text-lg">
              <i className="fas fa-laptop"></i>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">
              Certificate Hub
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Bonafide, NOC & letters
            </p>
          </button>

          {/* 3. Stationery Store */}
          <button
            onClick={() => setActiveModal('stationery')}
            className="p-4 sm:p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#fdf2f8] dark:bg-[#341824] border border-pink-100/90 dark:border-pink-900/40 neu-card-interactive"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/60 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-3 text-lg">
              <i className="fas fa-store"></i>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">
              Stationery Store
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Order notebooks & supplies
            </p>
          </button>

          {/* 4. Printout Center */}
          <button
            onClick={() => setActiveModal('printout')}
            className="p-4 sm:p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#eff6ff] dark:bg-[#172554] border border-blue-100/90 dark:border-blue-900/40 neu-card-interactive"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 text-lg">
              <i className="fas fa-print"></i>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">
              Printout Center
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Upload and print documents
            </p>
          </button>

          {/* 5. Canteen Token */}
          <button
            onClick={() => setActiveModal('canteen')}
            className="p-4 sm:p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#ecfeff] dark:bg-[#0c2e3a] border border-cyan-100/90 dark:border-cyan-900/40 neu-card-interactive"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3 text-lg">
              <i className="fas fa-utensils"></i>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">
              Canteen Token
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Pre-order meals & snacks
            </p>
          </button>

          {/* 6. Track Requests */}
          <button
            onClick={() => setActiveModal('track')}
            className="p-4 sm:p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#fff1f2] dark:bg-[#36151e] border border-rose-100/90 dark:border-rose-900/40 neu-card-interactive"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 text-lg">
              <i className="fas fa-receipt"></i>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">
              Track Requests
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              History & updates
            </p>
          </button>

          {/* 7. Help Desk */}
          <button
            onClick={() => setActiveModal('help')}
            className="p-4 sm:p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#f5f3ff] dark:bg-[#251b3a] border border-purple-100/90 dark:border-purple-900/40 neu-card-interactive"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 text-lg">
              <i className="fas fa-question-circle"></i>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">
              Help Desk
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Helpline & support contacts
            </p>
          </button>

          {/* 8. Time Table */}
          <button
            onClick={() => setActiveModal('timetable')}
            className="p-4 sm:p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#f0fdf4] dark:bg-[#122b1c] border border-emerald-100/90 dark:border-emerald-900/40 neu-card-interactive"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 text-lg">
              <i className="fas fa-clock"></i>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">
              Time Table
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Schedule, Attendance & Notices
            </p>
          </button>

          {/* 9. Campus Events (spans full or styled nicely) */}
          <button
            onClick={() => setActiveModal('events')}
            className="p-4 sm:p-5 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] bg-[#fdf2f8] dark:bg-[#341824] border border-pink-100/90 dark:border-pink-900/40 neu-card-interactive col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/60 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-3 text-lg">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-white">
              Campus Events
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Seminars, fests & schedules
            </p>
          </button>
        </div>
      </div>

      {/* 6. Footer matching Screenshot 3 */}
      <div className="pt-10 pb-6 text-center text-xs space-y-1 text-slate-500 dark:text-slate-400">
        <p className="font-extrabold uppercase tracking-wider text-[11px]">
          Powered by <span className="text-indigo-600 dark:text-indigo-400">RANBIDGE SOLUTIONS PVT LTD</span>
        </p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          © 2026 RANBIDGE SOLUTIONS PVT LTD. All Rights Reserved.
        </p>
      </div>

      {/* ======================= MODALS FOR THE 9 SERVICES ======================= */}

      {/* MODAL 1: Outpass Clearance */}
      {activeModal === 'outpass' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="neu-card w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center">
                  <i className="fas fa-running text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Outpass Clearance</h3>
                  <p className="text-xs text-slate-500">Submit exit permission or late arrival</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full neu-icon-btn text-slate-500"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleOutpassSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOutpassType(RequestType.PERMISSION)}
                  className={`p-3 rounded-xl text-xs font-black uppercase text-center border transition-all ${
                    outpassType === RequestType.PERMISSION 
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-300' 
                      : 'neu-flat-sm text-slate-600 dark:text-slate-400 border-transparent'
                  }`}
                >
                  Campus Outpass
                </button>
                <button
                  type="button"
                  onClick={() => setOutpassType(RequestType.LATE_ATTENDANCE)}
                  className={`p-3 rounded-xl text-xs font-black uppercase text-center border transition-all ${
                    outpassType === RequestType.LATE_ATTENDANCE 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-600 dark:text-emerald-300' 
                      : 'neu-flat-sm text-slate-600 dark:text-slate-400 border-transparent'
                  }`}
                >
                  Late Attendance
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={outpassDate}
                    onChange={(e) => setOutpassDate(e.target.value)}
                    required
                    className="neu-input"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {outpassType === RequestType.PERMISSION ? 'Departure Time' : 'Arrival Time'}
                  </label>
                  <input
                    type="time"
                    value={outpassDepartureTime}
                    onChange={(e) => setOutpassDepartureTime(e.target.value)}
                    required
                    className="neu-input"
                  />
                </div>
              </div>

              {outpassType === RequestType.PERMISSION && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Expected Return Time
                  </label>
                  <input
                    type="time"
                    value={outpassArrivalTime}
                    onChange={(e) => setOutpassArrivalTime(e.target.value)}
                    placeholder="Optional return time"
                    className="neu-input"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Reason for Exit / Permission
                </label>
                <textarea
                  value={outpassReason}
                  onChange={(e) => setOutpassReason(e.target.value)}
                  required
                  rows={3}
                  className="neu-textarea"
                  placeholder="State the exact reason (e.g. Medical emergency, Bank work, Family function)"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Parent / Guardian Phone
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  required
                  className="neu-input"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 neu-btn text-xs font-bold uppercase rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 neu-btn-primary text-xs font-bold uppercase rounded-xl"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Certificate Hub */}
      {activeModal === 'certificate' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="neu-card w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center">
                  <i className="fas fa-laptop text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Certificate Hub</h3>
                  <p className="text-xs text-slate-500">Apply for official college certificates</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="neu-icon-btn text-slate-500">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCertificateSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Certificate Type
                </label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  className="neu-select"
                >
                  <option value="Bonafide Certificate">Bonafide Certificate (General)</option>
                  <option value="Study & Conduct Certificate">Study & Conduct Certificate</option>
                  <option value="No Objection Certificate (NOC)">No Objection Certificate (NOC) for Internship</option>
                  <option value="Fee Structure Certificate">Fee Structure & Estimate Certificate</option>
                  <option value="Custody Certificate">Custody Certificate (Original Documents)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Purpose / Organization Name
                </label>
                <textarea
                  value={certPurpose}
                  onChange={(e) => setCertPurpose(e.target.value)}
                  required
                  rows={3}
                  className="neu-textarea"
                  placeholder="Specify why you need this certificate (e.g., Passport application, Scholarship, Internship at TCS)"
                />
              </div>

              <div className="neu-inset-sm p-4 rounded-xl text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-700 dark:text-slate-300">Processing Time:</p>
                <p>• E-Certificates are issued within 24 to 48 hours after HOD verification.</p>
                <p>• Digital copy will be dispatched to your student email: <strong>{user.email}</strong></p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 neu-btn text-xs font-bold uppercase rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 neu-btn-primary text-xs font-bold uppercase rounded-xl"
                >
                  Request Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Stationery Store */}
      {activeModal === 'stationery' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="neu-card w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center">
                  <i className="fas fa-store text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Campus Stationery Store</h3>
                  <p className="text-xs text-slate-500">Order essentials for pickup at Store counter</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="neu-icon-btn text-slate-500">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-3 pt-4">
              {[
                { id: 'pen-blue', title: 'Standard Gel Pen (Blue)', price: '₹10', icon: 'fa-pen' },
                { id: 'pen-black', title: 'Standard Gel Pen (Black)', price: '₹10', icon: 'fa-pen' },
                { id: 'sheets', title: 'A4 Assignment Sheets (Bundle)', price: '₹45', icon: 'fa-file-lines' },
                { id: 'record', title: 'Lab Observation Record Notebook', price: '₹60', icon: 'fa-book' },
                { id: 'graph', title: 'Engineering Drawing Sheets & Folder', price: '₹85', icon: 'fa-folder' }
              ].map((item) => (
                <div key={item.id} className="neu-inset-sm p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-300 flex items-center justify-center text-sm">
                      <i className={`fas ${item.icon}`}></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</p>
                      <p className="text-[11px] font-bold text-pink-600 dark:text-pink-400">{item.price}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOrderStationery(item.title, 1)}
                    className="neu-btn-primary px-3 py-1.5 text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-transform"
                  >
                    Order Now
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 neu-btn text-xs font-bold uppercase rounded-xl"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Printout Center */}
      {activeModal === 'printout' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="neu-card w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                  <i className="fas fa-print text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Printout Center</h3>
                  <p className="text-xs text-slate-500">Upload assignment or lab manual for xerox</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="neu-icon-btn text-slate-500">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handlePrintSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Upload Document (PDF / DOCX)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                  <i className="fas fa-cloud-arrow-up text-3xl text-blue-500 mb-2"></i>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {printFileName || 'Click to select or drag and drop file'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Maximum file size: 25 MB</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) => setPrintFileName(e.target.files?.[0]?.name || '')}
                    className="hidden"
                    id="print-upload"
                  />
                  <label htmlFor="print-upload" className="mt-3 inline-block px-4 py-1.5 neu-btn text-[11px] font-bold uppercase rounded-xl cursor-pointer">
                    Browse File
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Print Color
                  </label>
                  <select
                    value={printColor}
                    onChange={(e) => setPrintColor(e.target.value as any)}
                    className="neu-select"
                  >
                    <option value="bw">Black & White (₹1 / page)</option>
                    <option value="color">Full Color (₹5 / page)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Number of Copies
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={printCopies}
                    onChange={(e) => setPrintCopies(parseInt(e.target.value) || 1)}
                    className="neu-input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="doubleSided"
                  checked={printDoubleSided}
                  onChange={(e) => setPrintDoubleSided(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4"
                />
                <label htmlFor="doubleSided" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Double-Sided (Duplex) Printing
                </label>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 neu-btn text-xs font-bold uppercase rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 neu-btn-primary text-xs font-bold uppercase rounded-xl"
                >
                  Submit Print Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Canteen Token */}
      {activeModal === 'canteen' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="neu-card w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center">
                  <i className="fas fa-utensils text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Canteen Token Hub</h3>
                  <p className="text-xs text-slate-500">Skip the queue with a digital meal token</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="neu-icon-btn text-slate-500">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCanteenSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Select Meal / Snack Item
                </label>
                <select
                  value={selectedCanteenItem}
                  onChange={(e) => setSelectedCanteenItem(e.target.value)}
                  className="neu-select"
                >
                  <option value="South Indian Veg Thali - ₹70">South Indian Veg Thali - ₹70</option>
                  <option value="Special Chicken Biryani - ₹140">Special Chicken Biryani - ₹140</option>
                  <option value="Veg Fried Rice + Manchurian - ₹90">Veg Fried Rice + Manchurian - ₹90</option>
                  <option value="Samosa & Tea Combo - ₹30">Samosa & Tea Combo - ₹30</option>
                  <option value="Cold Coffee / Badam Shake - ₹35">Cold Coffee / Badam Shake - ₹35</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Pickup Slot
                </label>
                <select
                  value={canteenTimeSlot}
                  onChange={(e) => setCanteenTimeSlot(e.target.value)}
                  className="neu-select"
                >
                  <option value="12:45 PM - 01:15 PM">12:45 PM - 01:15 PM (Lunch Break)</option>
                  <option value="01:15 PM - 01:45 PM">01:15 PM - 01:45 PM (Afternoon Slot)</option>
                  <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM (Evening Snacks)</option>
                </select>
              </div>

              <div className="neu-inset-sm p-4 rounded-xl text-xs space-y-1 text-slate-500">
                <p className="font-bold text-slate-700 dark:text-slate-300">How Token Works:</p>
                <p>• Show your token number at the fast-track counter.</p>
                <p>• Pay via UPI on pickup or college smart card.</p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-3 neu-btn text-xs font-bold uppercase rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 neu-btn-primary text-xs font-bold uppercase rounded-xl"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Track Requests & Full History */}
      {activeModal === 'track' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="neu-card w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                  <i className="fas fa-receipt text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Track Requests & History</h3>
                  <p className="text-xs text-slate-500">Detailed verification status and audit logs</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="neu-icon-btn text-slate-500">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 py-4 flex-wrap">
              {['all', RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.GRANTED, RequestStatus.DENIED].map((st) => (
                <button
                  key={st}
                  onClick={() => setHistoryFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                    historyFilter === st 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'neu-inset-sm text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {st === 'all' ? 'All Requests' : st}
                </button>
              ))}
            </div>

            {/* Request items */}
            <div className="space-y-3">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <div key={req.id} className="neu-inset-sm p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {req.type}
                        </span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                          {req.id}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        req.status === RequestStatus.GRANTED ? 'bg-emerald-100 text-emerald-700' :
                        req.status === RequestStatus.DENIED ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                      "{req.reason}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-800/60">
                      <span>Date: {req.date || new Date(req.createdAt).toLocaleDateString()}</span>
                      <span>Checkpoint: <strong className="text-indigo-500">{req.currentStep || 'Processing'}</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <i className="fas fa-inbox text-3xl mb-2"></i>
                  <p className="text-xs font-bold uppercase">No records found for selected filter</p>
                </div>
              )}
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 neu-btn text-xs font-bold uppercase rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: Help Desk */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="neu-card w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center">
                  <i className="fas fa-question-circle text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Help Desk & Contacts</h3>
                  <p className="text-xs text-slate-500">Official college helplines and support</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="neu-icon-btn text-slate-500">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-3 pt-4">
              {[
                { title: 'Campus Main Security Gate', phone: '+91 8647 248858', desc: 'Gate Pass Verification & Campus Entry' },
                { title: 'Student Affairs & Grievance', phone: '08647-248859', desc: 'Discipline, Bonafide & Student Support' },
                { title: "Anti-Ragging Helpline", phone: '1800-180-5522', desc: '24x7 National & Campus Anti-Ragging Cell' },
                { title: 'Hostel Chief Warden', phone: '+91 94405 12345', desc: 'Hostel Outpass & Medical Emergencies' },
                { title: 'Transport / Bus Incharge', phone: '+91 98480 67890', desc: 'Route timings & College Bus passes' }
              ].map((item, idx) => (
                <div key={idx} className="neu-inset-sm p-3.5 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</p>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5">{item.phone}</p>
                  </div>
                  <a
                    href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                    className="neu-btn-primary px-3 py-1.5 text-[10px] font-black uppercase rounded-xl flex items-center gap-1"
                  >
                    <i className="fas fa-phone-alt"></i> Call
                  </a>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 neu-btn text-xs font-bold uppercase rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: Time Table */}
      {activeModal === 'timetable' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="neu-card w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <i className="fas fa-clock text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Time Table & Attendance</h3>
                  <p className="text-xs text-slate-500">{user.branch || 'CSE'} • Room 304</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="neu-icon-btn text-slate-500">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Attendance overview */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="neu-inset-sm p-3 rounded-xl text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Overall Attendance</p>
                <p className="text-xl font-black text-emerald-500">88.4%</p>
              </div>
              <div className="neu-inset-sm p-3 rounded-xl text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Total Classes</p>
                <p className="text-xl font-black text-indigo-500">142</p>
              </div>
              <div className="neu-inset-sm p-3 rounded-xl text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Classes Attended</p>
                <p className="text-xl font-black text-teal-500">126</p>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Today's Periods</p>
              {[
                { time: '09:00 - 10:00 AM', subject: 'Artificial Intelligence & Machine Learning', faculty: 'Dr. K. Srinivas', room: 'LH-304' },
                { time: '10:00 - 11:00 AM', subject: 'Cloud Computing & DevOps', faculty: 'Prof. M. Ramesh', room: 'LH-304' },
                { time: '11:15 - 12:15 PM', subject: 'Computer Networks', faculty: 'Dr. P. Lakshmi', room: 'LH-304' },
                { time: '01:15 - 03:15 PM', subject: 'AI & Data Science Laboratory', faculty: 'Lab Staff', room: 'Lab-2' },
                { time: '03:15 - 04:15 PM', subject: 'Library & Technical Seminar', faculty: 'Mentor Session', room: 'Library' }
              ].map((period, i) => (
                <div key={i} className="neu-inset-sm p-3 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{period.time}</span>
                    <p className="font-black text-slate-800 dark:text-slate-100">{period.subject}</p>
                    <p className="text-[10px] text-slate-400">{period.faculty} • {period.room}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 neu-btn text-xs font-bold uppercase rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: Campus Events */}
      {activeModal === 'events' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="neu-card w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500 text-white flex items-center justify-center">
                  <i className="fas fa-calendar-alt text-lg"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Campus Events & Notices</h3>
                  <p className="text-xs text-slate-500">Upcoming seminars, symposia & hackathons</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="neu-icon-btn text-slate-500">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-3 pt-4">
              {[
                { title: 'TechFest 2026: National Level Hackathon', date: 'Oct 28 - Oct 29', desc: 'Cash prize pool of ₹1,00,000. Registration open.' },
                { title: 'Workshop on Generative AI & LLMs', date: 'Nov 04, 2026', desc: 'Conducted by Google Developer Experts in Auditorium.' },
                { title: 'Annual Sports Meet & Athletic Events', date: 'Nov 14 - Nov 16', desc: 'Inter-branch Cricket, Volleyball, Track & Field.' },
                { title: 'TCS & Infosys Campus Placement Drive', date: 'Dec 02, 2026', desc: 'Eligible 3rd & 4th year CSE/ECE students.' }
              ].map((ev, i) => (
                <div key={i} className="neu-inset-sm p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="pr-3">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{ev.title}</p>
                    <p className="text-[11px] text-pink-600 dark:text-pink-400 font-bold mt-0.5">{ev.date}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{ev.desc}</p>
                  </div>
                  <button 
                    onClick={() => {
                      showNotification(`Registered successfully for ${ev.title}!`);
                    }}
                    className="neu-btn-primary px-3 py-1.5 text-[10px] font-black uppercase rounded-xl flex-shrink-0"
                  >
                    Register
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 neu-btn text-xs font-bold uppercase rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
