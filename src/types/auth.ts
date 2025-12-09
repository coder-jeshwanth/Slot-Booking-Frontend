export type UserRole = 'super-admin' | 'project-admin' | 'sales-user' | 'viewer' | 'customer';

export interface User {
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}
