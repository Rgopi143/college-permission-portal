import React, { useState, useEffect } from 'react';
import { StudentComplaint, ComplaintResponse, ComplaintAuditLog, ComplaintService } from '../services/complaintService';
import { User } from '../types';

interface ComplaintsProps {
  user: User;
}

const Complaints: React.FC<ComplaintsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'details'>('list');
  const [complaints, setComplaints] = useState<StudentComplaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<StudentComplaint | null>(null);
  const [responses, setResponses] = useState<ComplaintResponse[]>([]);
  const [auditLogs, setAuditLogs] = useState<ComplaintAuditLog[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    resolved: 0,
    closed: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state for new complaint
  const [newComplaint, setNewComplaint] = useState({
    complaint_type: 'ACADEMIC' as const,
    title: '',
    description: '',
    severity: 'MEDIUM' as const,
    anonymous: false,
    category: 'GENERAL' as const
  });
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  // Load complaints on component mount
  useEffect(() => {
    // Restore state from localStorage
    const savedTab = localStorage.getItem('complaints_activeTab');
    if (savedTab) setActiveTab(savedTab as any);
    
    loadComplaints();
    loadStats();
  }, []);

  // Save state and scroll position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('complaints_activeTab', activeTab);
  }, [activeTab]);

  // Restore scroll position after component mounts
  useEffect(() => {
    const savedScrollPosition = localStorage.getItem('page_scrollPosition');
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition));
    }
  }, []);

  // Save scroll position before component unmounts
  useEffect(() => {
    const handleScroll = () => {
      localStorage.setItem('complaints_scrollPosition', window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const data = await ComplaintService.getStudentComplaints(user.id);
      setComplaints(data);
    } catch (error) {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await ComplaintService.getComplaintStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadComplaintDetails = async (complaint: StudentComplaint) => {
    setSelectedComplaint(complaint);
    setActiveTab('details');
    
    try {
      const [responsesData, auditData] = await Promise.all([
        ComplaintService.getComplaintResponses(complaint.id),
        ComplaintService.getComplaintAuditLogs(complaint.id)
      ]);
      
      setResponses(responsesData);
      setAuditLogs(auditData);
    } catch (error) {
      setError('Failed to load complaint details');
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload evidence files first
      let evidenceUrls: string[] = [];
      if (evidenceFiles.length > 0) {
        const uploadResult = await ComplaintService.uploadEvidenceFiles('temp', evidenceFiles);
        if (uploadResult.success && uploadResult.urls) {
          evidenceUrls = uploadResult.urls;
        }
      }

      // Create complaint
      const result = await ComplaintService.createComplaint({
        student_id: user.id,
        ...newComplaint,
        evidence_files: evidenceUrls
      });

      if (result.success) {
        // Reset form and reload
        setNewComplaint({
          complaint_type: 'ACADEMIC',
          title: '',
          description: '',
          severity: 'MEDIUM',
          anonymous: false,
          category: 'GENERAL'
        });
        setEvidenceFiles([]);
        setActiveTab('list');
        loadComplaints();
        loadStats();
      } else {
        setError(result.error || 'Failed to create complaint');
      }
    } catch (error) {
      setError('Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'RESOLVED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Complaints & Feedback</h1>
        <p className="text-slate-600 dark:text-slate-400">Submit and track your complaints and feedback</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Total</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Pending</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.under_review}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Under Review</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Resolved</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.closed}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Closed</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Rejected</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          My Complaints
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          New Complaint
        </button>
        {selectedComplaint && (
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Complaint Details
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-red-800 dark:text-red-200">{error}</div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && !loading && (
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-500 dark:text-slate-400 mb-4">No complaints found</div>
              <button
                onClick={() => setActiveTab('create')}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Submit Your First Complaint
              </button>
            </div>
          ) : (
            complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => loadComplaintDetails(complaint)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{complaint.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(complaint.severity)}`}>
                    {complaint.severity}
                  </span>
                  <span>{complaint.complaint_type}</span>
                  <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 line-clamp-2">{complaint.description}</p>
                {complaint.evidence_files && complaint.evidence_files.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {complaint.evidence_files.length} evidence file(s) attached
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmitComplaint} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Complaint Type
              </label>
              <select
                value={newComplaint.complaint_type}
                onChange={(e) => setNewComplaint({...newComplaint, complaint_type: e.target.value as any})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              >
                <option value="ACADEMIC">Academic</option>
                <option value="FACULTY">Faculty</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="HARASSMENT">Harassment</option>
                <option value="BULLYING">Bullying</option>
                <option value="DISCRIMINATION">Discrimination</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Severity
              </label>
              <select
                value={newComplaint.severity}
                onChange={(e) => setNewComplaint({...newComplaint, severity: e.target.value as any})}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newComplaint.title}
              onChange={(e) => setNewComplaint({...newComplaint, title: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="Brief title of your complaint"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={newComplaint.description}
              onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              rows={6}
              placeholder="Detailed description of your complaint"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Evidence Files (Optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => setEvidenceFiles(Array.from(e.target.files || []))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            {evidenceFiles.length > 0 && (
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {evidenceFiles.length} file(s) selected
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              checked={newComplaint.anonymous}
              onChange={(e) => setNewComplaint({...newComplaint, anonymous: e.target.checked})}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
            />
            <label htmlFor="anonymous" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              Submit anonymously (Your identity will be hidden from other students)
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      )}

      {/* Details Tab */}
      {activeTab === 'details' && selectedComplaint && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {selectedComplaint.title}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedComplaint.status)}`}>
                {selectedComplaint.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Type:</span>
                <span className="ml-2 text-slate-900 dark:text-white">{selectedComplaint.complaint_type}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Severity:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getSeverityColor(selectedComplaint.severity)}`}>
                  {selectedComplaint.severity}
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Submitted:</span>
                <span className="ml-2 text-slate-900 dark:text-white">
                  {new Date(selectedComplaint.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Anonymous:</span>
                <span className="ml-2 text-slate-900 dark:text-white">
                  {selectedComplaint.anonymous ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</h3>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {selectedComplaint.description}
              </p>
            </div>

            {selectedComplaint.evidence_files && selectedComplaint.evidence_files.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Evidence Files</h3>
                <div className="space-y-2">
                  {selectedComplaint.evidence_files.map((file, index) => (
                    <a
                      key={index}
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <i className="fas fa-paperclip mr-2"></i>
                      {file.split('/').pop()}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selectedComplaint.resolution && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Resolution</h3>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedComplaint.resolution}
                </p>
              </div>
            )}
          </div>

          {/* Responses */}
          {responses.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Responses</h3>
              <div className="space-y-4">
                {responses.map((response) => (
                  <div key={response.id} className="border-l-4 border-indigo-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {response.response_by_role}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(response.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{response.response_text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Logs */}
          {auditLogs.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Activity Log</h3>
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {log.action_taken.replace('_', ' ')}
                      </span>
                      {log.action_details && (
                        <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                          {log.action_details}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Complaints;
