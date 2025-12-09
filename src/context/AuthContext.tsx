import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType, UserRole } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default users with credentials
const USERS: Record<string, { password: string; role: UserRole; name: string }> = {
  'superadmin@gmail.com': {
    password: 'superadmin',
    role: 'super-admin',
    name: 'Super Admin'
  },
  'projectadmin@gmail.com': {
    password: 'projectadmin',
    role: 'project-admin',
    name: 'Project Admin'
  },
  'salesuser@gmail.com': {
    password: 'salesuser',
    role: 'sales-user',
    name: 'Sales User'
  },
  'viewer@gmail.com': {
    password: 'viewer',
    role: 'viewer',
    name: 'Viewer'
  },
  'customer@gmail.com': {
    password: 'customer',
    role: 'customer',
    name: 'Customer'
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const userConfig = USERS[email.toLowerCase()];
    
    if (userConfig && userConfig.password === password) {
      setUser({
        email,
        role: userConfig.role,
        name: userConfig.name
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
