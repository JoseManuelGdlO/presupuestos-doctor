export interface User {
  email: string;
  name?: string;
  role?: string;
  uid?: string;
  companyId?: string; // ID de la empresa a la que pertenece
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
} 