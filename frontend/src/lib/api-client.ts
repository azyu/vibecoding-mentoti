import axios, { AxiosError, AxiosInstance } from 'axios';
import { 
  AuthResponse, 
  SignupData, 
  LoginData, 
  User, 
  UpdateProfileData,
  Mentor,
  MentorListQuery,
  MentorListResponse,
  MatchRequest,
  CreateMatchRequestData
} from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  // Auth endpoints
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/signup', data);
    this.setToken(response.data.token);
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/login', data);
    this.setToken(response.data.token);
    return response.data;
  }

  // User endpoints
  async getMe(): Promise<User> {
    const response = await this.client.get<User>('/me');
    return response.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await this.client.put<User>('/profile', data);
    return response.data;
  }

  async getMentors(query?: MentorListQuery): Promise<MentorListResponse> {
    const response = await this.client.get<MentorListResponse>('/mentors', {
      params: query,
    });
    return response.data;
  }

  // Match request endpoints
  async createMatchRequest(data: CreateMatchRequestData): Promise<MatchRequest> {
    const response = await this.client.post<MatchRequest>('/match-requests', data);
    return response.data;
  }

  async getIncomingRequests(): Promise<MatchRequest[]> {
    const response = await this.client.get<MatchRequest[]>('/match-requests/incoming');
    return response.data;
  }

  async getOutgoingRequests(): Promise<MatchRequest[]> {
    const response = await this.client.get<MatchRequest[]>('/match-requests/outgoing');
    return response.data;
  }

  async acceptRequest(requestId: string): Promise<MatchRequest> {
    const response = await this.client.put<MatchRequest>(`/match-requests/${requestId}/accept`);
    return response.data;
  }

  async rejectRequest(requestId: string): Promise<MatchRequest> {
    const response = await this.client.put<MatchRequest>(`/match-requests/${requestId}/reject`);
    return response.data;
  }

  async cancelRequest(requestId: string): Promise<void> {
    await this.client.delete(`/match-requests/${requestId}`);
  }
}

export const apiClient = new ApiClient();