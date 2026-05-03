/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface UsersResponse {
  users: UserRecord[];
}

export interface AuthResponse {
  token: string;
  user: UserRecord;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  password?: string;
}

export interface ApiError {
  error: string;
}
