
import { WorkflowRequest, RequestType, RequestStatus, WorkflowStep, UserRole, User } from './types';

export const BRANCHES = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology'];
export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const MOCK_MENTORS: User[] = [
  { id: 'MENTOR-001', name: 'Prof. Wilson', email: 'wilson@nec.edu', role: UserRole.MENTOR, branch: 'Computer Science' },
  { id: 'MENTOR-002', name: 'Prof. Specter', email: 'specter@nec.edu', role: UserRole.MENTOR, branch: 'Computer Science' },
  { id: 'MENTOR-003', name: 'Dr. Donna', email: 'donna@nec.edu', role: UserRole.MENTOR, branch: 'Electronics' },
];

export const MOCK_REQUESTS: WorkflowRequest[] = [
  {
    id: 'REQ-001',
    studentName: 'John Doe',
    rollNo: 'CS2021001',
    studentId: 'CS2021001',
    email: 'john@college.edu',
    branch: 'Computer Science',
    type: RequestType.PERMISSION,
    reason: 'Family Emergency',
    status: RequestStatus.PENDING,
    currentStep: WorkflowStep.MENTOR,
    createdAt: Date.now() - 3600000 * 2,
    logs: [
      { id: 'L1', role: UserRole.STUDENT, action: 'SUBMIT', timestamp: Date.now() - 3600000 * 2, userName: 'John Doe', studentId: 'CS2021001' }
    ]
  },
  {
    id: 'REQ-002',
    studentName: 'Jane Smith',
    rollNo: 'EC2021045',
    studentId: 'EC2021045',
    email: 'jane@college.edu',
    branch: 'Electronics',
    type: RequestType.LATE_ATTENDANCE,
    arrivalTime: '09:45 AM',
    date: '2023-10-25',
    reason: 'Bus Breakdown',
    status: RequestStatus.APPROVED,
    currentStep: WorkflowStep.HOD,
    createdAt: Date.now() - 3600000 * 5,
    logs: [
      { id: 'L2', role: UserRole.STUDENT, action: 'SUBMIT', timestamp: Date.now() - 3600000 * 5, userName: 'Jane Smith', studentId: 'EC2021045' },
      { id: 'L3', role: UserRole.MENTOR, action: 'APPROVE', timestamp: Date.now() - 3600000 * 3, userName: 'Prof. Wilson', studentId: 'EC2021045' }
    ]
  },
  {
    id: 'REQ-003',
    studentName: 'Mike Ross',
    rollNo: 'ME2021022',
    studentId: 'ME2021022',
    email: 'mike@college.edu',
    branch: 'Mechanical',
    type: RequestType.PERMISSION,
    reason: 'Project Exhibition',
    status: RequestStatus.APPROVED,
    currentStep: WorkflowStep.SECURITY,
    createdAt: Date.now() - 3600000 * 10,
    logs: [
      { id: 'L4', role: UserRole.STUDENT, action: 'SUBMIT', timestamp: Date.now() - 3600000 * 10, userName: 'Mike Ross', studentId: 'ME2021022' },
      { id: 'L5', role: UserRole.MENTOR, action: 'APPROVE', timestamp: Date.now() - 3600000 * 8, userName: 'Prof. Specter', studentId: 'ME2021022' },
      { id: 'L6', role: UserRole.HOD, action: 'APPROVE', timestamp: Date.now() - 3600000 * 4, userName: 'Dr. Hardman', studentId: 'ME2021022' }
    ]
  }
];
