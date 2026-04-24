
export enum UserRole {
  STUDENT = 'STUDENT',
  MENTOR = 'MENTOR',
  HOD = 'HOD',
  SECURITY = 'SECURITY',
  ADMIN = 'ADMIN'
}

export enum RequestType {
  PERMISSION = 'PERMISSION',
  LATE_ATTENDANCE = 'LATE_ATTENDANCE'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  GRANTED = 'GRANTED' // Specific to Security verification
}

export enum WorkflowStep {
  MENTOR = 'MENTOR',
  HOD = 'HOD',
  SECURITY = 'SECURITY',
  COMPLETED = 'COMPLETED'
}

export interface AuditLog {
  id: string;
  role: UserRole;
  action: 'APPROVE' | 'DENY' | 'SUBMIT' | 'GRANT';
  timestamp: number;
  userName: string;
  studentId: string; // New field for individual tracking
}

export interface WorkflowRequest {
  id: string;
  studentName: string;
  rollNo: string;
  studentId: string; // New field for individual tracking
  email: string;
  branch: string;
  type: RequestType;
  reason: string;
  status: RequestStatus;
  currentStep: WorkflowStep;
  createdAt: number;
  arrivalTime?: string; // Only for late attendance
  date?: string;
  logs: AuditLog[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch?: string;
  year?: string;
  mentorId?: string; // Links a student to their assigned mentor
  studentId?: string; // Explicit field for students
}
