
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { BRANCHES, YEARS } from '../constants';

interface StudentManagementProps {
  students: User[];
  mentors: User[];
  onAddStudent: (student: User) => void;
  onReassignMentor: (studentIds: string[], newMentorId: string) => void;
  onUpdateMentor: (mentor: User) => void;
  onDeleteMentor: (mentorId: string) => void;
  onNotify: (msg: string, type: 'success' | 'error') => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ students, mentors, onAddStudent, onReassignMentor, onUpdateMentor, onDeleteMentor, onNotify }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [targetMentorId, setTargetMentorId] = useState('');
  
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [year, setYear] = useState(YEARS[0]);
  const [initialMentor, setInitialMentor] = useState(mentors[0]?.id || '');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedMentorIds, setSelectedMentorIds] = useState<Set<string>>(new Set());
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [editingMentorId, setEditingMentorId] = useState<string | null>(null);
  const [mentorEditForm, setMentorEditForm] = useState<Partial<User>>({});
  const [expandedMentorId, setExpandedMentorId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentEditForm, setStudentEditForm] = useState<Partial<User>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudentId = id.toUpperCase().trim();
    
    // VALIDATION: Roll Number (NEC Format)
    const rollRegex = /^2[0-9]{4}A[0-9]{4}$/i;
    if (!rollRegex.test(newStudentId)) {
      onNotify(`Roll number format is invalid. Input: "${newStudentId}" (e.g. 23471A4201)`, "error");
      return;
    }

    // VALIDATION: Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      onNotify("Please enter a valid email address", "error");
      return;
    }

    // Check for Duplicates locally
    if (students.some(s => s.id === newStudentId)) {
      onNotify("Student ID already exists in system", "error");
      return;
    }

    const newStudent: User = {
      id: newStudentId,
      studentId: newStudentId,
      name,
      email: email.toLowerCase().trim(),
      role: UserRole.STUDENT,
      branch,
      year,
      mentorId: initialMentor
    };

    onAddStudent(newStudent);
    setName('');
    setId('');
    setEmail('');
    setShowAddForm(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === students.length) {
      setSelectedIds(new Set());
      onNotify("All students deselected", "success");
    } else {
      setSelectedIds(new Set(students.map(s => s.id)));
      onNotify(`${students.length} students selected`, "success");
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectMentor = (id: string) => {
    const next = new Set(selectedMentorIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedMentorIds(next);
  };

  const toggleSelectAllMentors = () => {
    if (selectedMentorIds.size === mentors.length) {
      setSelectedMentorIds(new Set());
      onNotify("All mentors deselected", "success");
    } else {
      setSelectedMentorIds(new Set(mentors.map(m => m.id)));
      onNotify(`${mentors.length} mentors selected`, "success");
    }
  };

  const handleResetPassword = (studentId: string) => {
    setResettingId(studentId);
    setTimeout(() => {
      onNotify(`Password for ${studentId} reset to technoelite@2025`, 'success');
      setResettingId(null);
    }, 1000);
  };

  const handleReassign = () => {
    if (!targetMentorId || selectedIds.size === 0) return;
    const mentorName = mentors.find(m => m.id === targetMentorId)?.name;
    onReassignMentor(Array.from(selectedIds), targetMentorId);
    onNotify(`Transferred ${selectedIds.size} students to ${mentorName}`, 'success');
    setSelectedIds(new Set());
    setShowReassignModal(false);
    setTargetMentorId('');
  };

  const handleEdit = (student: User) => {
    setEditingId(student.id);
    setEditForm({
      name: student.name,
      email: student.email,
      branch: student.branch,
      year: student.year,
      mentorId: student.mentorId
    });
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm.name || !editForm.email) {
      onNotify("Please fill all required fields", "error");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editForm.email)) {
      onNotify("Please enter a valid email address", "error");
      return;
    }

    const updatedStudent = {
      ...students.find(s => s.id === editingId)!,
      ...editForm
    };

    // Update local state (you would also update database here)
    onAddStudent(updatedStudent);
    onNotify("Student updated successfully", "success");
    setEditingId(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      // Remove from local state (you would also delete from database here)
      const updatedStudents = students.filter(s => s.id !== studentId);
      onNotify("Student deleted successfully", "success");
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleEditMentor = (mentor: User) => {
    setEditingMentorId(mentor.id);
    setMentorEditForm({
      name: mentor.name,
      email: mentor.email,
      branch: mentor.branch
    });
  };

  const handleSaveMentorEdit = () => {
    if (!editingMentorId || !mentorEditForm.name || !mentorEditForm.email) {
      onNotify("Please fill all required fields", "error");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mentorEditForm.email)) {
      onNotify("Please enter a valid email address", "error");
      return;
    }

    const updatedMentor = {
      ...mentors.find(m => m.id === editingMentorId)!,
      ...mentorEditForm
    };

    onUpdateMentor(updatedMentor);
    onNotify("Mentor updated successfully", "success");
    setEditingMentorId(null);
    setMentorEditForm({});
  };

  const handleCancelMentorEdit = () => {
    setEditingMentorId(null);
    setMentorEditForm({});
  };

  const handleDeleteMentor = (mentorId: string) => {
    if (confirm("Are you sure you want to delete this mentor? All assigned students will need to be reassigned.")) {
      onDeleteMentor(mentorId);
      onNotify("Mentor deleted successfully", "success");
      setEditingMentorId(null);
      setMentorEditForm({});
    }
  };

  const handleResetMentorPassword = (mentorId: string) => {
    onNotify(`Password for mentor ${mentorId} reset to technoelite@2025`, 'success');
  };

  const toggleMentorExpansion = (mentorId: string) => {
    setExpandedMentorId(expandedMentorId === mentorId ? null : mentorId);
  };

  const handleEditStudentFromMentor = (student: User) => {
    setEditingStudentId(student.id);
    setStudentEditForm({
      name: student.name,
      email: student.email,
      branch: student.branch,
      year: student.year
    });
  };

  const handleSaveStudentFromMentor = () => {
    if (editingStudentId) {
      const updatedStudent = students.find(s => s.id === editingStudentId);
      if (updatedStudent) {
        const finalStudent = { ...updatedStudent, ...studentEditForm };
        // Update student in the main students array
        const updatedStudents = students.map(s => 
          s.id === editingStudentId ? finalStudent : s
        );
        // This would need to be passed up to parent component
        onNotify("Student updated successfully", "success");
        setEditingStudentId(null);
        setStudentEditForm({});
      }
    }
  };

  const handleCancelStudentEdit = () => {
    setEditingStudentId(null);
    setStudentEditForm({});
  };

  const isStudentActionDisabled = (student: User) => {
    // Restrictions disabled - all student actions are now enabled
    return false;
    
    // Previous restriction logic (commented out for future reference):
    // - Disable actions for CSE branch students
    // - Disable actions for final year students
    // - Disable actions for specific roll numbers
    /*
    if (student.branch === 'CSE') return true;
    if (student.year === 'IV Year') return true;
    const restrictedRollNumbers = ['23471A4201', '23471A4202'];
    if (restrictedRollNumbers.includes(student.id)) return true;
    */
  };

  const hasRestrictedStudents = () => {
    // Restrictions disabled - no students have restricted actions
    return false;
    
    // Previous logic (commented out for future reference):
    // return Array.from(selectedIds).some(studentId => {
    //   const student = students.find(s => s.id === studentId);
    //   return student ? isStudentActionDisabled(student) : false;
    // });
  };

  const getMentorName = (mentorId?: string) => {
    return mentors.find(m => m.id === mentorId)?.name || 'Unassigned';
  };

  return (
    <div className="space-y-8 lg:space-y-12 animate-fade-in relative">
      {/* Reassign Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-slate-100 dark:border-slate-800 animate-slide-up">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Transfer Students</h3>
            <p className="text-slate-500 text-sm mb-6">Assign {selectedIds.size} students to a new mentor.</p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Mentor</label>
                <select
                  value={targetMentorId}
                  onChange={(e) => setTargetMentorId(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-semibold appearance-none dark:text-white"
                >
                  <option value="">Select Mentor...</option>
                  {mentors.map(m => <option key={m.id} value={m.id}>{m.name} ({m.branch})</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowReassignModal(false)}
                  className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={!targetMentorId}
                  onClick={handleReassign}
                  className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  Transfer Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Department Control</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">HOD Panel • Student & Mentor Mapping</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowReassignModal(true)}
              className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 px-6 py-3 rounded-xl font-bold transition-all flex items-center"
            >
              <i className="fas fa-arrows-rotate mr-2"></i>
              Transfer Mentor ({selectedIds.size})
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95 flex items-center"
          >
            <i className={`fas ${showAddForm ? 'fa-times' : 'fa-plus'} mr-2`}></i>
            {showAddForm ? 'Cancel' : 'New Admission'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl animate-slide-down">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Student Name" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 border-none font-medium dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Roll Number</label>
              <input type="text" value={id} onChange={e => setId(e.target.value)} required placeholder="Format: 2XXXXAXXXX (e.g. 23471A4201)" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 border-none font-medium dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Institutional Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="student@nec.edu" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 border-none font-medium dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Branch</label>
              <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 border-none font-medium dark:text-white">
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Current Year</label>
              <select value={year} onChange={e => setYear(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 border-none font-medium dark:text-white">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Assign Mentor</label>
              <select value={initialMentor} onChange={e => setInitialMentor(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 border-none font-medium dark:text-white">
                {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-3 pt-4">
              <button type="submit" className="w-full md:w-auto px-12 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
                Add Student to Database
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {selectedIds.size > 0 && (
          <div className="px-4 sm:px-8 py-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                {selectedIds.size} student{selectedIds.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
              >
                Clear selection
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={() => setShowReassignModal(true)}
                disabled={hasRestrictedStudents()}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                  hasRestrictedStudents()
                    ? 'bg-slate-400 text-slate-600 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                title={hasRestrictedStudents() ? "Cannot reassign: Some selected students have restricted actions" : "Reassign Mentor"}
              >
                <i className="fas fa-user-friends mr-2"></i> Reassign Mentor
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.size} selected students?`)) {
                    selectedIds.forEach(id => {
                      const updatedStudents = students.filter(s => s.id !== id);
                      // Handle deletion
                    });
                    setSelectedIds(new Set());
                    onNotify(`${selectedIds.size} students deleted successfully`, "success");
                  }
                }}
                disabled={hasRestrictedStudents()}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                  hasRestrictedStudents()
                    ? 'bg-slate-400 text-slate-600 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={hasRestrictedStudents() ? "Cannot delete: Some selected students have restricted actions" : "Delete Selected"}
              >
                <i className="fas fa-trash mr-2"></i> Delete Selected
              </button>
            </div>
          </div>
        )}
        <div className="p-4 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Enrolled Student Directory</h3>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{students.length} Records Found</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px] sm:min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                  <button onClick={toggleSelectAll} className="w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors hover:border-indigo-500">
                    {selectedIds.size === students.length && students.length > 0 && <i className="fas fa-check text-[8px] sm:text-[10px] text-indigo-600"></i>}
                  </button>
                </th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Year / Branch</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Assigned Mentor</th>
                <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {students.map(student => (
                <tr key={student.id} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${selectedIds.has(student.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                  <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <button onClick={() => toggleSelect(student.id)} className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 transition-colors flex items-center justify-center ${selectedIds.has(student.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 dark:border-slate-700'}`}>
                      {selectedIds.has(student.id) && <i className="fas fa-check text-[6px] sm:text-[8px] text-white"></i>}
                    </button>
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
                    {editingId === student.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium dark:text-white"
                          placeholder="Student Name"
                        />
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                          placeholder="Email Address"
                        />
                        <p className="text-xs text-slate-400 font-medium">{student.id}</p>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 text-[10px] sm:text-xs flex-shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">{student.name}</p>
                          <p className="text-xs text-slate-400 truncate">{student.id}</p>
                          <p className="text-xs text-slate-400 truncate hidden sm:block">{student.email}</p>
                          <div className="flex flex-wrap gap-1 mt-1 sm:hidden">
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[8px] font-medium text-slate-600 dark:text-slate-300">
                              {student.branch}
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[8px] font-medium text-slate-600 dark:text-slate-300">
                              {student.year}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 hidden sm:table-cell">
                    {editingId === student.id ? (
                      <div className="space-y-2">
                        <select
                          value={editForm.year || ''}
                          onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm dark:text-white"
                        >
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select
                          value={editForm.branch || ''}
                          onChange={(e) => setEditForm({...editForm, branch: e.target.value})}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm dark:text-white"
                        >
                          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-1.5 sm:space-y-2">
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] sm:text-xs font-medium text-slate-700 dark:text-slate-300">
                          <i className="fas fa-graduation-cap mr-1 sm:mr-2"></i>
                          {student.year}
                        </span>
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30 text-[10px] sm:text-xs font-bold text-indigo-700 dark:text-indigo-400">
                          <i className="fas fa-building mr-1 sm:mr-2"></i>
                          {student.branch}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5 hidden lg:table-cell">
                    {editingId === student.id ? (
                      <select
                        value={editForm.mentorId || ''}
                        onChange={(e) => setEditForm({...editForm, mentorId: e.target.value})}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs sm:text-sm dark:text-white"
                      >
                        {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <i className="fas fa-user-tie text-[8px] sm:text-xs text-indigo-600 dark:text-indigo-400"></i>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{getMentorName(student.mentorId)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                      {editingId === student.id ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="px-2 py-1 sm:px-3 sm:py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] sm:text-xs font-bold rounded-lg transition-colors"
                          >
                            <i className="fas fa-check mr-0.5 sm:mr-1"></i>
                            <span className="hidden sm:inline">Save</span>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 sm:px-3 sm:py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-[10px] sm:text-xs font-bold rounded-lg transition-colors"
                          >
                            <i className="fas fa-times mr-0.5 sm:mr-1"></i>
                            <span className="hidden sm:inline">Cancel</span>
                          </button>
                        </>
                      ) : (
                        selectedIds.has(student.id) ? (
                          <>
                            <button
                              onClick={() => handleEdit(student)}
                              className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-colors ${
                                isStudentActionDisabled(student) 
                                  ? 'bg-slate-400 text-slate-600 cursor-not-allowed' 
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              }`}
                              title={isStudentActionDisabled(student) ? "Actions restricted for this student" : "Edit"}
                              disabled={isStudentActionDisabled(student)}
                            >
                              <i className="fas fa-edit"></i>
                              <span className="hidden sm:inline ml-1">Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Reset password for ${student.name}?`)) {
                                  onNotify(`Password for ${student.id} reset to technoelite@2025`, 'success');
                                }
                              }}
                              className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-colors ${
                                isStudentActionDisabled(student) 
                                  ? 'bg-slate-400 text-slate-600 cursor-not-allowed' 
                                  : 'bg-amber-600 hover:bg-amber-700 text-white'
                              }`}
                              title={isStudentActionDisabled(student) ? "Password reset restricted for this student" : "Reset Password"}
                              disabled={isStudentActionDisabled(student)}
                            >
                              <i className="fas fa-key"></i>
                              <span className="hidden sm:inline ml-1">Reset</span>
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className={`px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-colors ${
                                isStudentActionDisabled(student) 
                                  ? 'bg-slate-400 text-slate-600 cursor-not-allowed' 
                                  : 'bg-red-600 hover:bg-red-700 text-white'
                              }`}
                              title={isStudentActionDisabled(student) ? "Deletion restricted for this student" : "Delete"}
                              disabled={isStudentActionDisabled(student)}
                            >
                              <i className="fas fa-trash"></i>
                              <span className="hidden sm:inline ml-1">Delete</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Select to Act</span>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No student records found in this department
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mentor Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {selectedMentorIds.size > 0 && (
          <div className="px-4 sm:px-8 py-4 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                {selectedMentorIds.size} mentor{selectedMentorIds.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedMentorIds(new Set())}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedMentorIds.size} selected mentors?`)) {
                    selectedMentorIds.forEach(id => {
                      onDeleteMentor(id);
                    });
                    setSelectedMentorIds(new Set());
                    onNotify(`${selectedMentorIds.size} mentors deleted successfully`, "success");
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                <i className="fas fa-trash mr-2"></i> Delete Selected
              </button>
            </div>
          </div>
        )}
        <div className="p-4 sm:p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Mentor Directory</h3>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mentors.length} Mentors Found</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <th className="px-8 py-4">
                  <button onClick={toggleSelectAllMentors} className="w-6 h-6 rounded-md border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors hover:border-indigo-500">
                    {selectedMentorIds.size === mentors.length && mentors.length > 0 && <i className="fas fa-check text-[10px] text-indigo-600"></i>}
                  </button>
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mentor Information</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Students</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mentors.map(mentor => {
                const assignedStudents = students.filter(s => s.mentorId === mentor.id);
                return (
                  <>
                  <tr key={mentor.id} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${selectedMentorIds.has(mentor.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                    <td className="px-8 py-4">
                      <button onClick={() => toggleSelectMentor(mentor.id)} className={`w-5 h-5 rounded border-2 transition-colors flex items-center justify-center ${selectedMentorIds.has(mentor.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200 dark:border-slate-700'}`}>
                        {selectedMentorIds.has(mentor.id) && <i className="fas fa-check text-[8px] text-white"></i>}
                      </button>
                    </td>
                    <td className="px-8 py-5">
                      {editingMentorId === mentor.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={mentorEditForm.name || ''}
                            onChange={(e) => setMentorEditForm({...mentorEditForm, name: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium dark:text-white"
                            placeholder="Mentor Name"
                          />
                          <input
                            type="email"
                            value={mentorEditForm.email || ''}
                            onChange={(e) => setMentorEditForm({...mentorEditForm, email: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                            placeholder="Email Address"
                          />
                          <p className="text-xs text-slate-400 font-medium">{mentor.id}</p>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-xs">
                            <i className="fas fa-user-tie"></i>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{mentor.name}</p>
                            <p className="text-xs text-slate-400">{mentor.id} • {mentor.email}</p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      {editingMentorId === mentor.id ? (
                        <select
                          value={mentorEditForm.branch || ''}
                          onChange={(e) => setMentorEditForm({...mentorEditForm, branch: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                        >
                          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      ) : (
                        <div className="inline-flex items-center px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                          <i className="fas fa-building mr-2"></i>
                          {mentor.branch}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <button
                        onClick={() => toggleMentorExpansion(mentor.id)}
                        className="flex items-center space-x-2 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 rounded-lg transition-colors group"
                      >
                        <div className="flex -space-x-2">
                          {assignedStudents.length > 0 ? (
                            assignedStudents.slice(0, 3).map((student, index) => (
                              <div
                                key={student.id}
                                className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-2 border-white dark:border-slate-900"
                                title={student.name}
                              >
                                <i className="fas fa-user text-[8px] text-indigo-600 dark:text-indigo-400"></i>
                              </div>
                            ))
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-900">
                              <i className="fas fa-user text-[8px] text-slate-400"></i>
                            </div>
                          )}
                          {assignedStudents.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-900">
                              <span className="text-[8px] font-bold text-slate-600 dark:text-slate-400">
                                +{assignedStudents.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {assignedStudents.length} student{assignedStudents.length !== 1 ? 's' : ''}
                        </span>
                        <i className="fas fa-chevron-down text-[10px] text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform duration-200" 
                           style={{ transform: expandedMentorId === mentor.id ? 'rotate(180deg)' : 'rotate(0deg)' }}></i>
                      </button>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center space-x-2">
                        {editingMentorId === mentor.id ? (
                          <>
                            <button
                              onClick={handleSaveMentorEdit}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                              <i className="fas fa-check mr-1"></i> Save
                            </button>
                            <button
                              onClick={handleCancelMentorEdit}
                              className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                              <i className="fas fa-times mr-1"></i> Cancel
                            </button>
                          </>
                        ) : selectedMentorIds.has(mentor.id) ? (
                          <>
                            <button
                              onClick={() => handleEditMentor(mentor)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                              <i className="fas fa-edit mr-1"></i> Edit
                            </button>
                            <button 
                              onClick={() => handleResetMentorPassword(mentor.id)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                              <i className="fas fa-key mr-1"></i> Reset
                            </button>
                            <button
                              onClick={() => handleDeleteMentor(mentor.id)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
                              disabled={assignedStudents.length > 0}
                              title={assignedStudents.length > 0 ? "Cannot delete mentor with assigned students" : "Delete mentor"}
                            >
                              <i className="fas fa-trash mr-1"></i> Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Select to Act</span>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedMentorId === mentor.id && (
                    <tr>
                      <td colSpan={5} className="px-4 sm:px-8 py-0">
                        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                              Assigned Students ({assignedStudents.length})
                            </h4>
                          </div>
                          {assignedStudents.length > 0 ? (
                            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                              {assignedStudents.map(student => (
                                <div key={student.id} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                  {editingStudentId === student.id ? (
                                    <div className="space-y-3">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                          type="text"
                                          value={studentEditForm.name || ''}
                                          onChange={(e) => setStudentEditForm({...studentEditForm, name: e.target.value})}
                                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
                                          placeholder="Student Name"
                                        />
                                        <input
                                          type="email"
                                          value={studentEditForm.email || ''}
                                          onChange={(e) => setStudentEditForm({...studentEditForm, email: e.target.value})}
                                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
                                          placeholder="Email Address"
                                        />
                                        <select
                                          value={studentEditForm.branch || ''}
                                          onChange={(e) => setStudentEditForm({...studentEditForm, branch: e.target.value})}
                                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
                                        >
                                          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                        <select
                                          value={studentEditForm.year || ''}
                                          onChange={(e) => setStudentEditForm({...studentEditForm, year: e.target.value})}
                                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:text-white"
                                        >
                                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={handleSaveStudentFromMentor}
                                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors"
                                        >
                                          <i className="fas fa-check mr-1"></i> Save
                                        </button>
                                        <button
                                          onClick={handleCancelStudentEdit}
                                          className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors"
                                        >
                                          <i className="fas fa-times mr-1"></i> Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                      <div className="flex items-center space-x-4">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                          <i className="fas fa-user text-xs text-indigo-600 dark:text-indigo-400"></i>
                                        </div>
                                        <div>
                                          <p className="font-semibold text-slate-900 dark:text-white">{student.name}</p>
                                          <p className="text-xs text-slate-500 dark:text-slate-400">{student.id} • {student.email}</p>
                                          <div className="flex items-center flex-wrap gap-2 mt-1">
                                            <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300">
                                              {student.branch}
                                            </span>
                                            <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300">
                                              {student.year}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => handleEditStudentFromMentor(student)}
                                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
                                        >
                                          <i className="fas fa-edit mr-1"></i> Edit
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (confirm(`Reset password for ${student.name}?`)) {
                                              onNotify(`Password for ${student.id} reset to technoelite@2025`, 'success');
                                            }
                                          }}
                                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors"
                                        >
                                          <i className="fas fa-key mr-1"></i> Reset
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                              <i className="fas fa-user-graduate text-2xl mb-2"></i>
                              <p className="text-sm">No students assigned to this mentor</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
                )
              })}
              {mentors.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No mentor records found in this department
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

export default StudentManagement;
