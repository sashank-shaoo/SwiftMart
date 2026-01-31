"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, SellerProfile } from "@/types";
import { authService, LoginResponse } from "@/services/authService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateLocation: (coordinates: [number, number]) => Promise<void>;
  changePassword: (passwordData: {
    old_password: string;
    new_password: string;
  }) => Promise<void>;
  becomeSeller: (sellerData: Partial<SellerProfile>) => Promise<void>;
  sendOtp: (email: string) => Promise<{ message: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ message: string }>;
  requestPasswordReset: (email: string) => Promise<{ message: string }>;
  resetPassword: (
    token: string,
    newPassword: string,
  ) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial user check (could be from local storage or a "me" endpoint)
    const storedUser = localStorage.getItem("sfm_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    localStorage.setItem("sfm_user", JSON.stringify(response.user));
    localStorage.setItem("sfm_token", response.token);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem("sfm_user");
    localStorage.removeItem("sfm_token");
  };

  const register = async (userData: Partial<User>) => {
    const newUser = await authService.register(userData);
    setUser(newUser);
    localStorage.setItem("sfm_user", JSON.stringify(newUser));
  };

  const updateUser = async (userData: Partial<User>) => {
    const updatedUser = await authService.updateUser(userData);
    setUser(updatedUser);
    localStorage.setItem("sfm_user", JSON.stringify(updatedUser));
  };

  const updateLocation = async (coordinates: [number, number]) => {
    await authService.updateLocation(coordinates);
    if (user) {
      const updatedUser = {
        ...user,
        location: { type: "Point" as const, coordinates },
      };
      setUser(updatedUser);
      localStorage.setItem("sfm_user", JSON.stringify(updatedUser));
    }
  };

  const changePassword = async (passwordData: {
    old_password: string;
    new_password: string;
  }) => {
    await authService.changePassword(passwordData);
  };

  const becomeSeller = async (sellerData: Partial<SellerProfile>) => {
    await authService.becomeSeller(sellerData);
    // Role might change after becoming a seller, would usually require a re-fetch or token refresh
    if (user) {
      const updatedUser = { ...user, role: "seller" as const };
      setUser(updatedUser);
      localStorage.setItem("sfm_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        updateUser,
        updateLocation,
        changePassword,
        becomeSeller,
        sendOtp: authService.sendOtp,
        verifyOtp: authService.verifyOtp,
        requestPasswordReset: authService.requestPasswordReset,
        resetPassword: authService.resetPassword,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
