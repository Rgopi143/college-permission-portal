
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, WorkflowRequest, AuditLog } from '../types';

/**
 * SQL SCHEMA FOR SUPABASE:
 * 
 * -- 1. Users Table
 * CREATE TABLE users (
 *   id TEXT PRIMARY KEY, -- Roll No or Staff ID
 *   name TEXT NOT NULL,
 *   email TEXT NOT NULL,
 *   role TEXT NOT NULL, -- STUDENT, MENTOR, HOD, SECURITY, ADMIN
 *   branch TEXT,
 *   year TEXT,
 *   mentor_id TEXT REFERENCES users(id),
 *   student_id TEXT -- New explicit field
 * );
 * 
 * -- 2. Requests Table
 * CREATE TABLE requests (
 *   id TEXT PRIMARY KEY,
 *   student_name TEXT NOT NULL,
 *   roll_no TEXT NOT NULL,
 *   student_id TEXT, -- New explicit field
 *   email TEXT NOT NULL,
 *   branch TEXT NOT NULL,
 *   type TEXT NOT NULL,
 *   reason TEXT,
 *   status TEXT NOT NULL,
 *   current_step TEXT NOT NULL,
 *   created_at BIGINT NOT NULL,
 *   arrival_time TEXT,
 *   date TEXT,
 *   logs JSONB DEFAULT '[]'::jsonb
 * );
 * 
 * -- Enable Realtime for these tables in Supabase Dashboard (Database -> Replication)
 */

const SUPABASE_URL = 'https://pezdgkgbhbejhmuceapd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlemRna2diaGJlamhtdWNlYXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjAwNDcsImV4cCI6MjA4NjgzNjA0N30.gqn6hoSj43Xp-ebQCQ4A0EAvWKS9y1qQj-L53l6AIoQ';

export class SupabaseService {
  private static _client: SupabaseClient | null = null;

  public static get client(): SupabaseClient | null {
    if (!SupabaseService._client) {
      SupabaseService._client = createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
    }
    return SupabaseService._client;
  }

  constructor() {
    // Constructor for instance creation if needed
    // Static client is handled by the getter
  }

  isAvailable(): boolean {
    return SupabaseService.client !== null;
  }

  // Data Mapping Helpers
  private mapRequestFromDb(row: any): WorkflowRequest {
    return {
      id: row.id,
      studentName: row.student_name,
      rollNo: row.roll_no,
      studentId: row.student_id || row.roll_no, // Fallback if missing
      email: row.email,
      branch: row.branch,
      type: row.type,
      reason: row.reason,
      status: row.status,
      currentStep: row.current_step,
      createdAt: Number(row.created_at),
      arrivalTime: row.arrival_time,
      date: row.date,
      logs: Array.isArray(row.logs) ? row.logs : []
    };
  }

  private mapUserFromDb(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      branch: row.branch,
      year: row.year,
      mentorId: row.mentor_id,
      studentId: row.student_id || (row.role === 'STUDENT' ? row.id : undefined)
    };
  }

  async fetchRequests(): Promise<WorkflowRequest[]> {
    if (!SupabaseService.client) return [];
    const { data, error } = await SupabaseService.client
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching requests:", error);
      return [];
    }
    return (data || []).map(row => this.mapRequestFromDb(row));
  }

  async fetchUsers(): Promise<User[]> {
    if (!SupabaseService.client) return [];
    const { data, error } = await SupabaseService.client
      .from('users')
      .select('*');
    
    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }
    return (data || []).map(row => this.mapUserFromDb(row));
  }

  async getUserById(id: string): Promise<User | null> {
    if (!SupabaseService.client) return null;
    const { data, error } = await SupabaseService.client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return this.mapUserFromDb(data);
  }

  async upsertRequest(request: WorkflowRequest): Promise<void> {
    if (!SupabaseService.client) return;
    const { error } = await SupabaseService.client
      .from('requests')
      .upsert({
        id: request.id,
        student_name: request.studentName,
        roll_no: request.rollNo,
        student_id: request.studentId, // Storing new field
        email: request.email,
        branch: request.branch,
        type: request.type,
        reason: request.reason,
        status: request.status,
        current_step: request.currentStep,
        created_at: request.createdAt,
        arrival_time: request.arrivalTime,
        date: request.date,
        logs: request.logs
      });
    
    if (error) console.error("Error upserting request:", error);
  }

  async upsertUser(user: User): Promise<void> {
    if (!SupabaseService.client) return;
    
    // For new students, set default password
    const userData: any = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      year: user.year,
      mentor_id: user.mentorId,
      student_id: user.studentId
    };
    
    // Add default password for new students
    if (user.role === 'STUDENT') {
      userData.password_hash = 'technoelite@2025'; // Default password
    }
    
    const { error } = await SupabaseService.client
      .from('users')
      .upsert(userData);
    
    if (error) console.error("Error upserting user:", error);
  }

  async reassignMentor(studentIds: string[], newMentorId: string): Promise<void> {
    if (!SupabaseService.client) return;
    const { error } = await SupabaseService.client
      .from('users')
      .update({ mentor_id: newMentorId })
      .in('id', studentIds);
    
    if (error) console.error("Error reassigning mentor:", error);
  }

  async deleteUser(userId: string): Promise<void> {
    if (!SupabaseService.client) return;
    const { error } = await SupabaseService.client
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) console.error("Error deleting user:", error);
  }

  subscribeToRequests(callback: (payload: { eventType: string, new: WorkflowRequest | null, old: any }) => void) {
    if (!SupabaseService.client) return null;
    return SupabaseService.client
      .channel('requests-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, (payload) => {
        callback({
          eventType: payload.eventType,
          new: payload.new ? this.mapRequestFromDb(payload.new) : null,
          old: payload.old
        });
      })
      .subscribe();
  }

  subscribeToUsers(callback: (payload: { eventType: string, new: User | null, old: any }) => void) {
    if (!SupabaseService.client) return null;
    return SupabaseService.client
      .channel('users-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        callback({
          eventType: payload.eventType,
          new: payload.new ? this.mapUserFromDb(payload.new) : null,
          old: payload.old
        });
      })
      .subscribe();
  }
}

export const supabaseService = new SupabaseService();
