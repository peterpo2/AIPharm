import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { buildApiUrl } from "../utils/api";

interface User {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  isAdmin: boolean;
  isStaff: boolean;
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
  isStaff?: boolean;
  isDeleted?: boolean;
}

interface UpdateProfileResponse {
  success?: boolean;
  message?: string;
  user?: User;
}

interface TwoFactorChallenge {
  twoFactorToken: string;
  destinationEmail?: string;
  codeExpiresAt?: string;
  emailSent?: boolean;
  cooldownSeconds?: number;
}

interface AuthActionResult {
  success: boolean;
  message?: string;
  requiresTwoFactor?: boolean;
  twoFactor?: TwoFactorChallenge;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<AuthActionResult>;
  verifyTwoFactor: (
    email: string,
    twoFactorToken: string,
    code: string,
    rememberMe?: boolean
  ) => Promise<AuthActionResult>;
  resendTwoFactor: (
    email: string,
    twoFactorToken: string
  ) => Promise<AuthActionResult>;
  register: (
    data: RegisterData
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (
    data: ProfileUpdateData
  ) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type JsonObject = Record<string, unknown>;

const toJsonObject = (value: unknown): JsonObject | null =>
  typeof value === "object" && value !== null ? (value as JsonObject) : null;

const safeJson = async (response: Response): Promise<JsonObject | null> => {
  try {
    const parsed = await response.json();
    return toJsonObject(parsed);
  } catch {
    return null;
  }
};

const mapTwoFactorChallenge = (
  data: JsonObject | null
): TwoFactorChallenge | undefined => {
  if (!data) {
    return undefined;
  }

  const token = data["twoFactorToken"];
  if (typeof token !== "string") {
    return undefined;
  }

  const destination = data["destinationEmail"];
  const codeExpiresAt = data["codeExpiresAt"];
  const emailSent = data["emailSent"];
  const cooldown = data["cooldownSeconds"];

  return {
    twoFactorToken: token,
    destinationEmail:
      typeof destination === "string" ? destination : undefined,
    codeExpiresAt:
      typeof codeExpiresAt === "string" ? codeExpiresAt : undefined,
    emailSent: typeof emailSent === "boolean" ? emailSent : undefined,
    cooldownSeconds:
      typeof cooldown === "number"
        ? Math.max(0, Math.floor(cooldown))
        : undefined,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;
  const isStaff = user?.isStaff || false;

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

      const response = await fetch(buildApiUrl("auth/me"), {
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
  ): Promise<AuthActionResult> => {
    try {
      const response = await fetch(buildApiUrl("auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await safeJson(response);
      const message =
        typeof data?.["message"] === "string"
          ? (data["message"] as string)
          : undefined;

      if (!response.ok) {
        return {
          success: false,
          message: message || "Грешка при вход",
        };
      }

      const twoFactor = mapTwoFactorChallenge(data);
      if (twoFactor) {
        return {
          success: false,
          requiresTwoFactor: true,
          message,
          twoFactor,
        };
      }

      const success = data?.["success"] === true;
      const user = (data?.["user"] as User | undefined) ?? undefined;
      const token =
        typeof data?.["token"] === "string"
          ? (data["token"] as string)
          : undefined;

      if (success && user && token) {
        setUser(user);

        if (rememberMe) {
          localStorage.setItem("authToken", token);
        } else {
          sessionStorage.setItem("authToken", token);
        }

        return { success: true, message };
      }

      return {
        success: false,
        message: message || "Грешка при вход",
      };
    } catch {
      return { success: false, message: "Мрежова грешка" };
    }
  };

  const verifyTwoFactor = async (
    email: string,
    twoFactorToken: string,
    code: string,
    rememberMe: boolean = false
  ): Promise<AuthActionResult> => {
    try {
      const response = await fetch(buildApiUrl("auth/verify-2fa"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, twoFactorToken, code }),
      });

      const data = await safeJson(response);
      const message =
        typeof data?.["message"] === "string"
          ? (data["message"] as string)
          : undefined;

      if (!response.ok) {
        return {
          success: false,
          message: message || "Невалиден код",
          requiresTwoFactor: data?.["requiresTwoFactor"] === true,
          twoFactor: mapTwoFactorChallenge(data),
        };
      }

      const success = data?.["success"] === true;
      const user = (data?.["user"] as User | undefined) ?? undefined;
      const token =
        typeof data?.["token"] === "string"
          ? (data["token"] as string)
          : undefined;

      if (success && user && token) {
        setUser(user);

        if (rememberMe) {
          localStorage.setItem("authToken", token);
        } else {
          sessionStorage.setItem("authToken", token);
        }

        return { success: true, message };
      }

      return {
        success: false,
        message: message || "Невалиден код",
      };
    } catch {
      return { success: false, message: "Мрежова грешка" };
    }
  };

  const resendTwoFactor = async (
    email: string,
    twoFactorToken: string
  ): Promise<AuthActionResult> => {
    try {
      const response = await fetch(buildApiUrl("auth/resend-2fa"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, twoFactorToken }),
      });

      const data = await safeJson(response);
      const message =
        typeof data?.["message"] === "string"
          ? (data["message"] as string)
          : undefined;

      if (!response.ok) {
        return {
          success: false,
          message: message || "Грешка при изпращане на кода",
        };
      }

      return {
        success: true,
        message,
        requiresTwoFactor: true,
        twoFactor: mapTwoFactorChallenge(data),
      };
    } catch {
      return { success: false, message: "Мрежова грешка" };
    }
  };

  const register = async (registerData: RegisterData) => {
    try {
      const response = await fetch(buildApiUrl("auth/register"), {
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
      await fetch(buildApiUrl("auth/logout"), {
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
      const response = await fetch(buildApiUrl(`users/${user.id}`), {
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
        isStaff,
        isLoading,
        login,
        verifyTwoFactor,
        resendTwoFactor,
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
