"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

/* ─── Step 1: Forgot Password ─── */
export function useForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Email address is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return false;
    setLoading(true);
    setError("");
    try {
      await authService.requestPasswordReset(email, "user");
      setSent(true);
      return true;
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const goToResetPage = () => {
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  };

  return {
    email,
    setEmail,
    error,
    setError,
    loading,
    sent,
    submit,
    goToResetPage,
  };
}

/* ─── Step 2: Reset Password ─── */
export interface ResetForm {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}

export function useResetPassword(initialEmail: string = "") {
  const router = useRouter();

  const [form, setForm] = useState<ResetForm>({
    email: initialEmail,
    otp: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [done, setDone] = useState(false);

  const updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name])
      setErrors((prev) => {
        const u = { ...prev };
        delete u[name];
        return u;
      });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.otp.trim()) newErrors.otp = "OTP code is required";
    else if (!/^\d{6}$/.test(form.otp)) newErrors.otp = "OTP must be 6 digits";
    if (!form.new_password) newErrors.new_password = "New password is required";
    else if (form.new_password.length < 8)
      newErrors.new_password = "Password must be at least 8 characters";
    if (form.new_password !== form.confirm_password)
      newErrors.confirm_password = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (): Promise<boolean> => {
    if (!validate()) return false;
    setLoading(true);
    try {
      await authService.resetPassword(
        form.email,
        form.otp,
        form.new_password,
        "user",
      );
      setDone(true);
      return true;
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        otp: err?.message || "Invalid or expired code. Please try again.",
      }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resend = async (): Promise<boolean> => {
    if (!form.email) return false;
    setResendLoading(true);
    try {
      await authService.requestPasswordReset(form.email, "user");
      setErrors({});
      return true;
    } catch {
      return false;
    } finally {
      setResendLoading(false);
    }
  };

  const goToLogin = () => router.push("/login");

  return {
    form,
    errors,
    loading,
    resendLoading,
    done,
    updateField,
    submit,
    resend,
    goToLogin,
  };
}
