
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, WorkflowRequest, RequestType, RequestStatus, WorkflowStep, AuditLog } from './types';
import { MOCK_REQUESTS, YEARS, MOCK_MENTORS } from './constants';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Footer from './components/Footer';
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import StudentPortal from './components/StudentPortal';
import ApprovalDashboard from './components/ApprovalDashboard';
import AdminDashboard from './components/AdminDashboard';
import Analytics from './components/Analytics';
import StudentManagement from './components/StudentManagement';
import CreativeHub from './components/CreativeHub';
import Complaints from './components/Complaints';
import Syllabus from './components/Syllabus';
import Toast from './components/Toast';
import { geminiService } from './services/geminiService';
import { supabaseService } from './services/supabaseService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'app'>('login');
  const [requests, setRequests] = useState<WorkflowRequest[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [mentors, setMentors] = useState<User[]>(MOCK_MENTORS);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const handleTabChange = (tab: string) => {
    console.log('Tab changing to:', tab);
    setActiveTab(tab);
  };
  const [aiInsight, setAiInsight] = useState<string>('');
  const [studentFormType, setStudentFormType] = useState<RequestType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('collegeflow_theme');
    return saved === 'dark';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('collegeflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('collegeflow_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const showGlobalToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    if (supabaseService.isAvailable()) {
      try {
        const [dbRequests, dbUsers] = await Promise.all([
          supabaseService.fetchRequests(),
          supabaseService.fetchUsers()
        ]);
        
        setRequests(dbRequests.length > 0 ? dbRequests : []);
        
        if (dbUsers.length > 0) {
          const fetchedStudents = dbUsers.filter(u => u.role === UserRole.STUDENT);
          const fetchedMentors = dbUsers.filter(u => u.role !== UserRole.STUDENT);
          setStudents(fetchedStudents);
          if (fetchedMentors.length > 0) setMentors(fetchedMentors);
        }
      } catch (e) {
        console.error("Supabase sync failed, using mock fallback.");
        setRequests(MOCK_REQUESTS);
      }
    } else {
      setRequests(MOCK_REQUESTS);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('collegeflow_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setView('app');
    }
    loadData();

    if (supabaseService.isAvailable()) {
      const requestSub = supabaseService.subscribeToRequests((payload) => {
        if (payload.eventType === 'INSERT') {
          setRequests(prev => {
            if (prev.find(r => r.id === payload.new?.id)) return prev;
            return [payload.new as WorkflowRequest, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setRequests(prev => prev.map(r => r.id === payload.new?.id ? payload.new as WorkflowRequest : r));
        } else if (payload.eventType === 'DELETE') {
          setRequests(prev => prev.filter(r => r.id !== payload.old.id));
        }
      });

      const userSub = supabaseService.subscribeToUsers((payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const updatedUser = payload.new as User;
          if (updatedUser.role === UserRole.STUDENT) {
            setStudents(prev => {
              const exists = prev.find(s => s.id === updatedUser.id);
              if (exists) return prev.map(s => s.id === updatedUser.id ? updatedUser : s);
              return [updatedUser, ...prev];
            });
          } else {
            setMentors(prev => {
              const exists = prev.find(m => m.id === updatedUser.id);
              if (exists) return prev.map(m => m.id === updatedUser.id ? updatedUser : m);
              return [updatedUser, ...prev];
            });
          }
        }
      });

      return () => {
        requestSub?.unsubscribe();
        userSub?.unsubscribe();
      };
    }
  }, [loadData]);

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    setView('app');
    localStorage.setItem('collegeflow_user', JSON.stringify(user));
    
    if (supabaseService.isAvailable()) {
      setIsSyncing(true);
      await supabaseService.upsertUser(user);
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    localStorage.removeItem('collegeflow_user');
    setActiveTab('dashboard');
    setStudentFormType(null);
  };

  const handleLandingAction = (type: RequestType) => {
    if (!currentUser) {
      setView('login');
      return;
    }
    setStudentFormType(type);
    setView('app');
    setActiveTab('dashboard');
  };

  const addStudent = async (student: User) => {
    // Validation for Roll Number Format - Updated to match correct format
    const rollRegex = /^2[0-9]{4}A[0-9]{4}$/i;
    if (!rollRegex.test(student.id)) {
      showGlobalToast("Invalid Roll Number Format (e.g. 23471A4201)", "error");
      return;
    }

    // Validation for Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student.email)) {
      showGlobalToast("Invalid Email Format", "error");
      return;
    }

    // Check for existing ID
    if (students.some(s => s.id === student.id)) {
      showGlobalToast("Student ID already registered", "error");
      return;
    }

    const studentWithId = { ...student, studentId: student.id };
    setStudents(prev => [studentWithId, ...prev]);
    if (supabaseService.isAvailable()) {
      setIsSyncing(true);
      await supabaseService.upsertUser(studentWithId);
      setIsSyncing(false);
    }
    showGlobalToast("Student added successfully", "success");
  };

  const reassignStudentsMentor = async (studentIds: string[], newMentorId: string) => {
    setStudents(prev => prev.map(student => 
      studentIds.includes(student.id) 
        ? { ...student, mentorId: newMentorId }
        : student
    ));
    if (supabaseService.isAvailable()) {
      setIsSyncing(true);
      await supabaseService.reassignMentor(studentIds, newMentorId);
      setIsSyncing(false);
    }
  };

  const updateMentor = async (mentor: User) => {
    setMentors(prev => prev.map(m => m.id === mentor.id ? mentor : m));
    if (supabaseService.isAvailable()) {
      setIsSyncing(true);
      await supabaseService.upsertUser(mentor);
      setIsSyncing(false);
    }
  };

  const deleteMentor = async (mentorId: string) => {
    setMentors(prev => prev.filter(m => m.id !== mentorId));
    // Reassign all students from deleted mentor to first available mentor
    const availableMentor = mentors.find(m => m.id !== mentorId);
    if (availableMentor) {
      setStudents(prev => prev.map(student => 
        student.mentorId === mentorId 
          ? { ...student, mentorId: availableMentor.id }
          : student
      ));
    }
    if (supabaseService.isAvailable()) {
      setIsSyncing(true);
      await supabaseService.deleteUser(mentorId);
      setIsSyncing(false);
    }
  };

  const updateRequest = async (requestId: string, action: 'APPROVE' | 'DENY' | 'GRANT') => {
    if (!currentUser) return;

    const targetRequest = requests.find(r => r.id === requestId);
    if (!targetRequest) return;

    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      role: currentUser.role,
      action,
      timestamp: Date.now(),
      userName: currentUser.name,
      studentId: targetRequest.studentId
    };

    let newStatus = targetRequest.status;
    let newStep = targetRequest.currentStep;

    if (action === 'DENY') {
      newStatus = RequestStatus.DENIED;
    } else if (action === 'APPROVE') {
      if (targetRequest.currentStep === WorkflowStep.MENTOR) newStep = WorkflowStep.HOD;
      else if (targetRequest.currentStep === WorkflowStep.HOD) newStep = WorkflowStep.SECURITY;
      newStatus = RequestStatus.APPROVED;
    } else if (action === 'GRANT') {
      newStatus = RequestStatus.GRANTED;
      newStep = WorkflowStep.COMPLETED;
    }

    const updatedRequest: WorkflowRequest = {
      ...targetRequest,
      status: newStatus,
      currentStep: newStep,
      logs: [...targetRequest.logs, newLog]
    };

    setRequests(prev => prev.map(req => req.id === requestId ? updatedRequest : req));
    
    if (supabaseService.isAvailable()) {
      setIsSyncing(true);
      await supabaseService.upsertRequest(updatedRequest);
      setIsSyncing(false);
    }
  };

  const submitNewRequest = async (newReq: Partial<WorkflowRequest>) => {
    if (!currentUser) return;

    const existingPending = requests.find(r => 
      r.studentId === (currentUser.studentId || currentUser.id) && 
      r.type === newReq.type && 
      (r.status === RequestStatus.PENDING || r.status === RequestStatus.APPROVED)
    );

    if (existingPending) {
      showGlobalToast(`You already have an active ${newReq.type?.replace('_', ' ')} request.`, "error");
      return;
    }

    if (!newReq.reason || newReq.reason.trim().length < 5) {
      showGlobalToast("Reason must be at least 5 characters long.", "error");
      return;
    }

    const studentId = currentUser.studentId || currentUser.id || 'N/A';
    
    const fullReq: WorkflowRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: currentUser.name || 'Unknown',
      rollNo: currentUser.id || 'N/A',
      studentId: studentId,
      email: currentUser.email || 'N/A',
      branch: currentUser.branch || 'N/A',
      type: newReq.type || RequestType.PERMISSION,
      reason: newReq.reason || '',
      arrivalTime: newReq.arrivalTime,
      date: newReq.date,
      status: RequestStatus.PENDING,
      currentStep: WorkflowStep.MENTOR,
      createdAt: Date.now(),
      logs: [{
        id: 'L-START',
        role: UserRole.STUDENT,
        action: 'SUBMIT',
        timestamp: Date.now(),
        userName: currentUser.name || 'Unknown',
        studentId: studentId
      }]
    };
    
    setRequests(prev => [fullReq, ...prev]);
    setActiveTab('status');
    showGlobalToast("Request submitted successfully.", "success");

    if (supabaseService.isAvailable()) {
      setIsSyncing(true);
      await supabaseService.upsertRequest(fullReq);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === UserRole.ADMIN && requests.length > 0) {
      geminiService.analyzeRequests(requests).then(setAiInsight);
    }
  }, [currentUser, requests]);

  if (view === 'landing') {
    return (
      <LandingPage 
        onSelectAction={handleLandingAction} 
        onLoginClick={() => setView('login')} 
        isDarkMode={isDarkMode} 
        onToggleDark={toggleDarkMode} 
      />
    );
  }

  if (view === 'login') {
    return (
      <Login 
        onLogin={handleLogin} 
        onBack={() => setView('landing')} 
        isDarkMode={isDarkMode} 
        onToggleDark={toggleDarkMode} 
      />
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing with Cloud State...</p>
        </div>
      );
    }

    if (!currentUser) return null;

    const studentRequests = requests.filter(r => r.rollNo === currentUser.id || r.email === currentUser.email || r.studentId === currentUser.id);

    switch (activeTab) {
      case 'dashboard':
        if (currentUser.role === UserRole.STUDENT) {
            return <StudentPortal 
                        user={currentUser}
                        requests={studentRequests} 
                        onNewRequest={submitNewRequest} 
                        initialType={studentFormType || RequestType.PERMISSION} 
                    />;
        }
        if (currentUser.role === UserRole.ADMIN) return <AdminDashboard requests={requests} insight={aiInsight} />;
        return <ApprovalDashboard user={currentUser} requests={requests} onAction={updateRequest} />;
      case 'analytics':
        return <Analytics requests={requests} />;
      case 'status':
        return <StudentPortal user={currentUser} requests={studentRequests} onNewRequest={submitNewRequest} showStatusOnly />;
      case 'students':
        if (currentUser.role === UserRole.HOD) {
          return (
            <StudentManagement 
              students={students} 
              mentors={mentors}
              onAddStudent={addStudent} 
              onReassignMentor={reassignStudentsMentor}
              onUpdateMentor={updateMentor}
              onDeleteMentor={deleteMentor}
              onNotify={showGlobalToast}
            />
          );
        }
        return <div className="p-12 text-center text-slate-400 dark:text-slate-600">Access Denied</div>;
      case 'creative':
        return <CreativeHub onNotify={showGlobalToast} />;
      case 'complaints':
        if (currentUser.role === UserRole.STUDENT) {
          return <Complaints user={currentUser} />;
        }
        return <div className="p-12 text-center text-slate-400 dark:text-slate-600">Access Denied</div>;
      case 'syllabus':
        if (currentUser.role === UserRole.STUDENT) {
          return <Syllabus user={currentUser} />;
        }
        return <div className="p-12 text-center text-slate-400 dark:text-slate-600">Access Denied</div>;
      default:
        return <div>Page Not Found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar 
        user={currentUser!} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
        user={currentUser!} 
        isDarkMode={isDarkMode} 
        onToggleDark={toggleDarkMode}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={handleLogout}
      />
        {isSyncing && (
          <div className="h-0.5 bg-indigo-100 dark:bg-slate-800 overflow-hidden sticky top-16 z-20">
            <div className="h-full bg-indigo-600 animate-progress origin-left"></div>
          </div>
        )}
        
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={clearToast} 
          />
        )}

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
        <div className="h-8"></div>
        {currentUser?.role !== UserRole.STUDENT && <Footer />}
      </div>
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
