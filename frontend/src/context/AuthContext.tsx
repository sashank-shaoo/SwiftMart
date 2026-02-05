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
import OtpModal from "@/components/auth/OtpModal";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User> | FormData) => Promise<void>;
  updateLocation: (locationData: {
    address?: string;
    latitude?: number;
    longitude?: number;
  }) => Promise<void>;
  changePassword: (passwordData: {
    old_password: string;
    new_password: string;
  }) => Promise<void>;
  becomeSeller: (sellerData: Partial<SellerProfile>) => Promise<void>;
  sendOtp: (email: string) => Promise<{ message: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ message: string }>;
  verificationEmail: string | null;
  showOtpModal: boolean;
  setShowOtpModal: (show: boolean) => void;
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
  const [verificationEmail, setVerificationEmail] = useState<string | null>(
    null,
  );
  const [showOtpModal, setShowOtpModal] = useState(false);

  useEffect(() => {
    // Immediate hydration from localStorage to prevent flash
    const saved = localStorage.getItem("sfm_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.warn("Auth hydration failed:", e);
      }
    }

    const syncSession = async () => {
      try {
        const data = await authService.getMe();
        setUser(data.user);
        localStorage.setItem("sfm_user", JSON.stringify(data.user));

        // If user is loaded but NOT verified, trigger the modal automatically
        if (data.user && !data.user.is_verified_email) {
          setVerificationEmail(data.user.email);
          setShowOtpModal(true);
        }
      } catch (err: any) {
        // If getting profile fails (e.g. 401), clear local state
        setUser(null);
        localStorage.removeItem("sfm_user");
      } finally {
        setLoading(false);
      }
    };

    syncSession();
  }, []);

  // Persistent check: If user becomes unverified or shifts, trigger modal
  useEffect(() => {
    if (user && !user.is_verified_email && !showOtpModal) {
      setVerificationEmail(user.email);
      setShowOtpModal(true);
    }
  }, [user, showOtpModal]);

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      localStorage.setItem("sfm_user", JSON.stringify(data.user));
    } catch (err: any) {
      // Handle the case where login fails due to unverified email
      if (err.message.includes("verify your account first")) {
        setVerificationEmail(email);
        setShowOtpModal(true);
      }
      throw err;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem("sfm_user");
    localStorage.removeItem("sfm_token");
  };

  const register = async (userData: Partial<User>) => {
    const data = await authService.register(userData);
    if (data.verification_sent) {
      setVerificationEmail(userData.email!);
      setShowOtpModal(true);
    } else {
      setUser(data.user);
      localStorage.setItem("sfm_user", JSON.stringify(data.user));
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    const response = await authService.verifyOtp(email, otp);

    // Update local user state to 'verified' so the modal doesn't re-trigger
    if (user && user.email === email) {
      const updatedUser = { ...user, is_verified_email: true };
      setUser(updatedUser);
      localStorage.setItem("sfm_user", JSON.stringify(updatedUser));
    }

    setVerificationEmail(null);
    setShowOtpModal(false);
    return response;
  };

  const updateUser = async (userData: Partial<User> | FormData) => {
    const updatedUser = await authService.updateUser(userData);
    setUser(updatedUser);
    localStorage.setItem("sfm_user", JSON.stringify(updatedUser));
  };

  const updateLocation = async (locationData: {
    address?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    const response = await authService.updateLocation(locationData);
    if (user && response.latitude && response.longitude) {
      const updatedUser = {
        ...user,
        location: {
          type: "Point" as const,
          coordinates: [response.longitude, response.latitude] as [
            number,
            number,
          ],
        },
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
        verificationEmail,
        showOtpModal,
        setShowOtpModal,
        login,
        logout,
        register,
        updateUser,
        updateLocation,
        changePassword,
        becomeSeller,
        sendOtp: authService.sendOtp,
        verifyOtp: verifyOtp,
        requestPasswordReset: authService.requestPasswordReset,
        resetPassword: authService.resetPassword,
      }}>
      {children}
      {showOtpModal && verificationEmail && (
        <OtpModal
          email={verificationEmail}
          isOpen={showOtpModal}
          onSuccess={() => {
            setShowOtpModal(false);
          }}
        />
      )}
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
