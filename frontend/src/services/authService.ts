import { apiFetch } from "@/lib/apiClient";
import { User, SellerProfile } from "@/types";

export interface LoginResponse {
  user: User;
  token: string;
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

  register: async (userData: Partial<User>): Promise<User> => {
    return apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  refreshToken: async (): Promise<{ token: string }> => {
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

  becomeSeller: async (sellerData: Partial<SellerProfile>): Promise<void> => {
    return apiFetch("/auth/become-seller", {
      method: "POST",
      body: JSON.stringify(sellerData),
    });
  },

  updateUser: async (userData: Partial<User>): Promise<User> => {
    return apiFetch("/auth/update", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
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

  registerSeller: async (sellerData: Partial<SellerProfile>): Promise<void> => {
    return apiFetch("/auth/seller/register", {
      method: "POST",
      body: JSON.stringify(sellerData),
    });
  },

  updateLocation: async (coordinates: [number, number]): Promise<void> => {
    return apiFetch("/auth/update-location", {
      method: "POST",
      body: JSON.stringify({ coordinates }),
    });
  },

  getLocation: async (): Promise<{ coordinates: [number, number] }> => {
    return apiFetch("/auth/location");
  },

  calculateDistance: async (
    targetLocation: [number, number],
  ): Promise<{ distance: number }> => {
    return apiFetch("/auth/calculate-distance", {
      method: "POST",
      body: JSON.stringify({ target_location: targetLocation }),
    });
  },
};
