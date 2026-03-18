"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useResetPassword } from "@/hooks/usePasswordReset";
import { useNotification } from "@/context/NotificationContext";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { Lock, KeyRound, CheckCircle, RefreshCw } from "lucide-react";
import styles from "@/styles/ForgotPassword.module.css";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const { notifySuccess, notifyError } = useNotification();
  const {
    form,
    errors,
    loading,
    resendLoading,
    done,
    updateField,
    submit,
    resend,
    goToLogin,
  } = useResetPassword(searchParams.get("email") || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok) notifySuccess("Password reset successfully!");
  };

  const handleResend = async () => {
    const ok = await resend();
    if (ok) notifySuccess("A new reset code has been sent to your email.");
    else notifyError("Failed to resend. Please try again.");
  };

  return (
    <div className={styles.pageWrapper}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={styles.card}>
        <div className={styles.iconBadge}>
          <KeyRound size={28} />
        </div>

        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "contents" }}>
              <div className={styles.header}>
                <h1 className={styles.title}>Reset Password</h1>
                <p className={styles.subtitle}>
                  Enter the 6-digit code we sent to your email and choose a new
                  password.
                </p>
              </div>

              <div className={styles.steps}>
                <div className={`${styles.step} ${styles.stepActive}`} />
                <div className={`${styles.step} ${styles.stepActive}`} />
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={updateField}
                  error={errors.email}
                />

                <div>
                  <Input
                    label="6-Digit OTP Code"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="e.g. 482931"
                    value={form.otp}
                    onChange={updateField}
                    error={errors.otp}
                  />
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      color: "var(--color-primary-dark)",
                      opacity: 0.75,
                      marginTop: "0.4rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}>
                    <RefreshCw size={13} />
                    {resendLoading ? "Resending..." : "Resend code"}
                  </button>
                </div>

                <Input
                  label="New Password"
                  name="new_password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.new_password}
                  onChange={updateField}
                  error={errors.new_password}
                  icon={<Lock size={18} />}
                />

                <Input
                  label="Confirm New Password"
                  name="confirm_password"
                  type="password"
                  placeholder="Repeat new password"
                  value={form.confirm_password}
                  onChange={updateField}
                  error={errors.confirm_password}
                  icon={<Lock size={18} />}
                />

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={loading}>
                  Reset Password
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.successBox}>
              <div className={styles.successIcon}>
                <CheckCircle size={28} />
              </div>
              <p className={styles.successTitle}>Password Updated!</p>
              <p className={styles.successText}>
                Your password has been reset successfully. You can now log in
                with your new password.
              </p>
              <Button variant="primary" onClick={goToLogin}>
                Go to Login →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.footer}>
          Remembered it after all?{" "}
          <Link href="/login" className={styles.link}>
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
