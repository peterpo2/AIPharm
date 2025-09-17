import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  isAdmin: boolean;
  createdAt: string;
  isDeleted: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<RegisterData>) => Promise<{ success: boolean; message?: string }>;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'https://localhost:7001/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      }
    } catch (error) {
      // Silently handle auth check failure when backend is not running
      // This is expected behavior when backend is offline
      if (error instanceof Error && error.message === 'Failed to fetch') {
        console.warn('Backend API not available - authentication disabled');
      } else {
        console.error('Auth check failed:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        setUser(data.user);
        
        // Save token
        if (rememberMe) {
          localStorage.setItem('authToken', data.token);
        } else {
          sessionStorage.setItem('authToken', data.token);
        }
        
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Грешка при вход' };
      }
    } catch {
      return { success: false, message: 'Мрежова грешка' };
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      return { 
        success: data.success || false, 
        message: data.message || (data.success ? 'Успешна регистрация' : 'Грешка при регистрация')
      };
    } catch {
      return { success: false, message: 'Мрежова грешка' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
      });
    } catch {
      // Silently handle logout errors and continue with local logout
    } finally {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<RegisterData>) => {
    if (!user) return { success: false, message: 'Не сте влезли в системата' };

    try {
      await fetch(`${API_BASE_URL}/auth/users/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return { success: true, message: 'Успешно обновяване' };
    } catch {
      return { success: false, message: 'Мрежова грешка' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};