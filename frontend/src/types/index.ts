export enum UserRole {
  MENTOR = 'mentor',
  MENTEE = 'mentee',
}

export enum MatchRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  bio?: string;
  techStack?: string[];
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  bio?: string;
  techStack?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  techStack?: string[];
  profileImage?: string;
}

export interface Mentor {
  id: string;
  name: string;
  bio?: string;
  techStack: string[];
  profileImage?: string;
  isMatched: boolean;
}

export interface MentorListQuery {
  name?: string;
  techStack?: string[];
  sortBy?: 'name' | 'createdAt';
  page?: number;
  limit?: number;
}

export interface MentorListResponse {
  data: Mentor[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MatchRequest {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorProfileImage?: string;
  menteeId: string;
  menteeName: string;
  menteeProfileImage?: string;
  status: MatchRequestStatus;
  message?: string;
  createdAt: string;
}

export interface CreateMatchRequestData {
  mentorId: string;
  message?: string;
}