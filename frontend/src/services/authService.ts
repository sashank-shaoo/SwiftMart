import { apiFetch } from "@/lib/apiClient";
import { User, SellerProfile } from "@/types";

export interface LoginResponse {
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async (): Promise<void> => {
    return apiFetch("/auth/logout", { method: "POST" });
  },

  getMe: async (): Promise<{ user: User }> => {
    return apiFetch("/auth/me");
  },

  register: async (
    userData: Partial<User>,
  ): Promise<{
    user: User;
    verification_sent: boolean;
  }> => {
    return apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  refreshToken: async (): Promise<void> => {
    return apiFetch("/auth/refresh-token", { method: "POST" });
  },

  sendOtp: async (email: string): Promise<{ message: string }> => {
    return apiFetch("/auth/send-verification-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  verifyOtp: async (
    email: string,
    otp: string,
  ): Promise<{ message: string }> => {
    return apiFetch("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    return apiFetch("/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (
    token: string,
    password: string,
  ): Promise<{ message: string }> => {
    return apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },

  becomeSeller: async (
    sellerData: Partial<SellerProfile>,
  ): Promise<{
    user: User;
    seller_profile: SellerProfile;
  }> => {
    return apiFetch("/auth/become-seller", {
      method: "POST",
      body: JSON.stringify(sellerData),
    });
  },

  updateUser: async (userData: Partial<User> | FormData): Promise<User> => {
    const isFormData = userData instanceof FormData;
    const data = await apiFetch("/auth/update", {
      method: "PUT",
      body: isFormData ? userData : JSON.stringify(userData),
      // Headers handles Content-Type automatically for FormData
    });
    return data.user;
  },

  requestEmailUpdate: async (): Promise<{ message: string }> => {
    return apiFetch("/auth/request-email-update", { method: "POST" });
  },

  verifyEmailUpdate: async (
    otp: string,
    newEmail: string,
  ): Promise<{ message: string }> => {
    return apiFetch("/auth/verify-email-update", {
      method: "POST",
      body: JSON.stringify({ otp, new_email: newEmail }),
    });
  },

  changePassword: async (passwordData: {
    old_password: string;
    new_password: string;
  }): Promise<{ message: string }> => {
    return apiFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  },

  registerSeller: async (
    sellerData: Partial<SellerProfile>,
  ): Promise<{
    user: User;
    seller_profile: SellerProfile;
    verification_sent: boolean;
  }> => {
    return apiFetch("/auth/seller/register", {
      method: "POST",
      body: JSON.stringify(sellerData),
    });
  },

  updateLocation: async (locationData: {
    address?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<any> => {
    return apiFetch("/auth/update-location", {
      method: "POST",
      body: JSON.stringify(locationData),
    });
  },

  getLocation: async (): Promise<{ coordinates: [number, number] }> => {
    return apiFetch("/auth/location");
  },

  calculateDistance: async (
    targetLatitude: number,
    targetLongitude: number,
  ): Promise<{ distance: { kilometers: number; miles: number } }> => {
    return apiFetch("/auth/calculate-distance", {
      method: "POST",
      body: JSON.stringify({ targetLatitude, targetLongitude }),
    });
  },
};
