import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { buildApiUrl, logResolvedApiBase } from "../utils/apiBase";

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
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    data: Partial<RegisterData>
  ) => Promise<{ success: boolean; message?: string }>;
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

// Ensure we log the resolved API base once on import for easier diagnostics
logResolvedApiBase();

const buildUrl = (path: string) => buildApiUrl(path);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;

  // Check auth status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(buildUrl("auth/me"), {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
      }
    } catch (error) {
      console.warn("⚠️ Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      const response = await fetch(buildUrl("auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        setUser(data.user);

        if (rememberMe) {
          localStorage.setItem("authToken", data.token);
        } else {
          sessionStorage.setItem("authToken", data.token);
        }

        return { success: true, message: data.message };
      } else {
        return {
          success: false,
          message: data.message || "Грешка при вход",
        };
      }
    } catch {
      return { success: false, message: "Мрежова грешка" };
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const response = await fetch(buildUrl("auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();
      return {
        success: data.success || false,
        message:
          data.message ||
          (data.success ? "Успешна регистрация" : "Грешка при регистрация"),
      };
    } catch {
      return { success: false, message: "Мрежова грешка" };
    }
  };

  const logout = async () => {
    try {
      await fetch(buildUrl("auth/logout"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            localStorage.getItem("authToken") ||
            sessionStorage.getItem("authToken")
          }`,
        },
      });
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<RegisterData>) => {
    if (!user) return { success: false, message: "Не сте влезли в системата" };

    try {
      await fetch(buildUrl(`auth/users/${user.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      return { success: true, message: "Успешно обновяване" };
    } catch {
      return { success: false, message: "Мрежова грешка" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
