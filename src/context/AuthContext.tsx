import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

type Role = "user" | "homeowner" | "admin" | "agent";

interface User {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  role: Role;
  trustScore?: number;
  verificationLevel?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    phone: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
    role: Role,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("lookrooms_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      document.documentElement.dataset.theme = parsedUser.role || "user";
    } else {
      document.documentElement.dataset.theme = "user";
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      document.documentElement.dataset.theme = user.role || "user";
    } else {
      document.documentElement.dataset.theme = "user";
    }
  }, [user]);

  const login = async (phone: string, password: string) => {
    try {
      const { data } = await axiosInstance.post("/auth/login", { phone, password });
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("lookrooms_user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("lookrooms_token", data.token);
        }
        return { success: true, user: data.user };
      }
      return { success: false, error: "Login failed" };
    } catch (error: any) {
      console.error("Login failed", error);
      return { success: false, error: error.response?.data?.error || "Network error" };
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    role: Role,
  ) => {
    try {
      const { data } = await axiosInstance.post("/auth/register", { name, email, phone, password, role });
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("lookrooms_user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("lookrooms_token", data.token);
        }
        return { success: true };
      }
      return { success: false, error: "Registration failed" };
    } catch (error: any) {
      console.error("Registration failed", error);
      return { success: false, error: error.response?.data?.error || "Network error" };
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const { data } = await axiosInstance.get(`/users/${user.id || user._id}`);
      setUser(data);
      localStorage.setItem("lookrooms_user", JSON.stringify(data));
    } catch (error) {
      console.error("Refresh user failed", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("lookrooms_user");
    localStorage.removeItem("lookrooms_token");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
