import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
}

interface ProfileUpdateData {
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  isAdmin?: boolean;
  isDeleted?: boolean;
}

interface UpdateProfileResponse {
  success?: boolean;
  message?: string;
  user?: User;
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
    data: ProfileUpdateData
  ) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔑 Environment-based API base (normalized)
const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_URL_DOCKER ||
  "http://localhost:8080/api";

const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

const buildUrl = (path: string) => `${API_BASE}/${path.replace(/^\/+/, "")}`;

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

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!user) {
      return { success: false, message: "Не сте влезли в системата" };
    }

    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return { success: false, message: "Липсва валидна сесия" };
    }

    try {
      const response = await fetch(buildUrl(`users/${user.id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      let result: UpdateProfileResponse | null = null;
      try {
        result = (await response.json()) as UpdateProfileResponse;
      } catch {
        result = null;
      }

      if (!response.ok || !result?.success) {
        return {
          success: false,
          message: result?.message || "Грешка при обновяване на профила",
        };
      }

      if (result.user) {
        setUser(result.user);
      }

      return {
        success: true,
        message: result.message || "Успешно обновяване",
      };
    } catch (error) {
      console.warn("⚠️ Profile update failed:", error);
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
