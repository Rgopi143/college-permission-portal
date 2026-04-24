import { supabaseService, SupabaseService } from './supabaseService';

export interface StudentComplaint {
  id: string;
  student_id: string;
  complaint_type: 'ACADEMIC' | 'FACULTY' | 'INFRASTRUCTURE' | 'HARASSMENT' | 'BULLYING' | 'DISCRIMINATION' | 'OTHER';
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolution?: string;
  anonymous: boolean;
  evidence_files?: string[];
  category: 'GENERAL' | 'ACADEMIC' | 'FACULTY' | 'INFRASTRUCTURE' | 'HARASSMENT' | 'BULLYING' | 'DISCRIMINATION' | 'OTHER';
}

export interface ComplaintResponse {
  id: string;
  complaint_id: string;
  response_type: 'ACKNOWLEDGE' | 'REQUEST_MORE_INFO' | 'REQUEST_EVIDENCE' | 'ASSIGN_ACTION' | 'ESCALATE' | 'PROVIDE_GUIDANCE' | 'REJECT' | 'CLOSE';
  response_text: string;
  response_by?: string;
  response_by_role: string;
  timestamp: string;
  deadline?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  created_at: string;
  updated_at: string;
}

export interface ComplaintAuditLog {
  id: string;
  complaint_id: string;
  action_taken: 'CREATED' | 'ASSIGNED' | 'ESCALATED' | 'CLOSED' | 'REOPENED' | 'INVESTIGATING' | 'RESOLVED';
  action_by?: string;
  action_details?: string;
  timestamp: string;
  notes?: string;
}

export class ComplaintService {
  // Create a new complaint
  static async createComplaint(complaint: Omit<StudentComplaint, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string; complaint?: StudentComplaint }> {
    try {
      const { data, error } = await SupabaseService.client
        .from('student_complaints')
        .insert([{
          ...complaint,
          evidence_files: complaint.evidence_files ? JSON.stringify(complaint.evidence_files) : null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating complaint:', error);
        return { success: false, error: error.message };
      }

      // Log the creation action
      await this.logComplaintAction(data.id, 'CREATED', complaint.student_id, 'Complaint created successfully');

      return { success: true, complaint: data };
    } catch (error) {
      console.error('Complaint creation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get student's complaints
  static async getStudentComplaints(studentId: string): Promise<StudentComplaint[]> {
    try {
      const { data, error } = await SupabaseService.client
        .from('student_complaints')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching student complaints:', error);
        return [];
      }

      // Parse evidence files JSON
      return data.map(complaint => ({
        ...complaint,
        evidence_files: complaint.evidence_files ? JSON.parse(complaint.evidence_files) : []
      }));
    } catch (error) {
      console.error('Complaint fetch error:', error);
      return [];
    }
  }

  // Get all complaints (for mentors/HODs/admins)
  static async getAllComplaints(status?: string): Promise<StudentComplaint[]> {
    try {
      let query = SupabaseService.client
        .from('student_complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching all complaints:', error);
        return [];
      }

      // Parse evidence files JSON
      return data.map(complaint => ({
        ...complaint,
        evidence_files: complaint.evidence_files ? JSON.parse(complaint.evidence_files) : []
      }));
    } catch (error) {
      console.error('Complaint fetch error:', error);
      return [];
    }
  }

  // Update complaint status
  static async updateComplaintStatus(complaintId: string, status: string, resolution?: string, assignedTo?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = { status };
      
      if (resolution) {
        updateData.resolution = resolution;
        updateData.resolved_at = new Date().toISOString();
      }
      
      if (assignedTo) {
        updateData.assigned_to = assignedTo;
      }

      const { error } = await SupabaseService.client
        .from('student_complaints')
        .update(updateData)
        .eq('id', complaintId);

      if (error) {
        console.error('Error updating complaint status:', error);
        return { success: false, error: error.message };
      }

      // Log the action
      await this.logComplaintAction(complaintId, status as any, assignedTo, `Status updated to ${status}`);

      return { success: true };
    } catch (error) {
      console.error('Complaint update error:', error);
      return { success: false, error: error.message };
    }
  }

  // Add response to complaint
  static async addResponse(response: Omit<ComplaintResponse, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await SupabaseService.client
        .from('complaint_responses')
        .insert([response]);

      if (error) {
        console.error('Error adding response:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Response creation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get complaint responses
  static async getComplaintResponses(complaintId: string): Promise<ComplaintResponse[]> {
    try {
      const { data, error } = await SupabaseService.client
        .from('complaint_responses')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching complaint responses:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Response fetch error:', error);
      return [];
    }
  }

  // Get complaint audit logs
  static async getComplaintAuditLogs(complaintId: string): Promise<ComplaintAuditLog[]> {
    try {
      const { data, error } = await SupabaseService.client
        .from('student_complaint_audit_logs')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Audit log fetch error:', error);
      return [];
    }
  }

  // Log complaint action
  private static async logComplaintAction(complaintId: string, action: any, actionBy: string, details?: string): Promise<void> {
    try {
      await SupabaseService.client
        .from('student_complaint_audit_logs')
        .insert([{
          complaint_id: complaintId,
          action_taken: action,
          action_by: actionBy,
          action_details: details,
          notes: details
        }]);
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }

  // Get complaint statistics
  static async getComplaintStats(studentId?: string): Promise<{
    total: number;
    pending: number;
    under_review: number;
    resolved: number;
    closed: number;
    rejected: number;
  }> {
    try {
      let query = SupabaseService.client
        .from('student_complaints')
        .select('status');

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching complaint stats:', error);
        return { total: 0, pending: 0, under_review: 0, resolved: 0, closed: 0, rejected: 0 };
      }

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(c => c.status === 'PENDING').length || 0,
        under_review: data?.filter(c => c.status === 'UNDER_REVIEW').length || 0,
        resolved: data?.filter(c => c.status === 'RESOLVED').length || 0,
        closed: data?.filter(c => c.status === 'CLOSED').length || 0,
        rejected: data?.filter(c => c.status === 'REJECTED').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Stats fetch error:', error);
      return { total: 0, pending: 0, under_review: 0, resolved: 0, closed: 0, rejected: 0 };
    }
  }

  // Upload evidence files
  static async uploadEvidenceFiles(complaintId: string, files: File[]): Promise<{ success: boolean; urls?: string[]; error?: string }> {
    try {
      const urls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${complaintId}/evidence_${Date.now()}_${i}.${fileExt}`;
        const filePath = `complaint_evidence/${fileName}`;

        const { data: uploadData, error: uploadError } = await SupabaseService.client.storage
          .from('complaint_evidence')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Error uploading evidence file:', uploadError);
          return { success: false, error: uploadError.message };
        }

        const { data: { publicUrl } } = SupabaseService.client.storage
          .from('complaint_evidence')
          .getPublicUrl(filePath);

        urls.push(publicUrl);
      }

      return { success: true, urls };
    } catch (error) {
      console.error('Evidence upload error:', error);
      return { success: false, error: error.message };
    }
  }
}
