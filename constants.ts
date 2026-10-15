
import { WorkflowRequest, RequestType, RequestStatus, WorkflowStep, UserRole, User } from './types';

export const BRANCHES = [
  'Computer Science',
  'Computer Science (Emerging Technologies)',
  'Electronics',
  'Mechanical',
  'Civil',
  'Information Technology'
];
export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export const DEFAULT_USERS: User[] = [
  {
    id: '23471A4245',
    studentId: '23471A4245',
    name: 'R Gopinath Reddy',
    email: '23471a4245@nrtec.in',
    role: UserRole.STUDENT,
    branch: 'Computer Science (Emerging Technologies)',
    year: '3rd Year',
    password_hash: 'CHINNU143',
    phone: '+91 9876543210'
  },
  {
    id: 'ADMIN-001',
    name: 'System Administrator',
    email: 'technoelite@nec',
    role: UserRole.ADMIN,
    password_hash: 'technoelite@2025'
  },
  {
    id: 'HOD-001',
    name: 'Head of Department',
    email: 'technoelite@hodnec',
    role: UserRole.HOD,
    branch: 'Computer Science',
    password_hash: 'technoelite@2025'
  },
  {
    id: 'MENTOR-001',
    name: 'Mentor Coordinator',
    email: 'technoelite@mentornec',
    role: UserRole.MENTOR,
    branch: 'Computer Science',
    password_hash: 'technoelite@2025'
  },
  {
    id: 'SEC-001',
    name: 'Security Supervisor',
    email: 'technoelite@securitynec',
    role: UserRole.SECURITY,
    password_hash: 'technoelite@2025'
  }
];

export const MOCK_STUDENTS: User[] = DEFAULT_USERS.filter(u => u.role === UserRole.STUDENT);
export const MOCK_MENTORS: User[] = DEFAULT_USERS.filter(u => u.role !== UserRole.STUDENT);
export const MOCK_REQUESTS: WorkflowRequest[] = [];

