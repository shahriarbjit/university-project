import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthResponse, UserRecord } from "@shared/api";

export type User = UserRecord;

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  token: string | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<AuthActionResult>;
  logout: () => void;
  register: (email: string, password: string, fullName: string) => Promise<AuthActionResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = "nsu_portal_auth_token";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem(AUTH_STORAGE_KEY));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const syncUserFromToken = async () => {
      if (!token) {
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setToken(null);
          setCurrentUser(null);
          return;
        }

        const data = (await response.json()) as { user: User };
        setCurrentUser(data.user);
      } catch (_error) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setToken(null);
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    syncUserFromToken();
  }, [token]);

  const login = async (email: string, password: string): Promise<AuthActionResult> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = (await response.json()) as AuthResponse | { error: string };

      if (!response.ok || !("token" in data)) {
        return {
          success: false,
          error: "error" in data ? data.error : "Login failed",
        };
      }

      localStorage.setItem(AUTH_STORAGE_KEY, data.token);
      setToken(data.token);
      setCurrentUser(data.user);

      return { success: true };
    } catch (_error) {
      return { success: false, error: "Unable to login right now" };
    }
  };

  const logout = (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setCurrentUser(null);
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<AuthActionResult> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = (await response.json()) as AuthResponse | { error: string };

      if (!response.ok || !("token" in data)) {
        return {
          success: false,
          error: "error" in data ? data.error : "Registration failed",
        };
      }

      localStorage.setItem(AUTH_STORAGE_KEY, data.token);
      setToken(data.token);
      setCurrentUser(data.user);

      return { success: true };
    } catch (_error) {
      return { success: false, error: "Unable to register right now" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(token && currentUser),
        currentUser,
        token,
        authLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
