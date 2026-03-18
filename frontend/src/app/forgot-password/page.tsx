"use client";

import React from "react";
import { useForgotPassword } from "@/hooks/usePasswordReset";
import { useNotification } from "@/context/NotificationContext";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { Mail, KeyRound, CheckCircle } from "lucide-react";
import styles from "@/styles/ForgotPassword.module.css";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const { notifySuccess } = useNotification();
  const {
    email,
    setEmail,
    error,
    setError,
    loading,
    sent,
    submit,
    goToResetPage,
  } = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok) notifySuccess("Reset code sent! Check your inbox.");
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
          {!sent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "contents" }}>
              <div className={styles.header}>
                <h1 className={styles.title}>Forgot Password?</h1>
                <p className={styles.subtitle}>
                  No worries! Enter your email and we'll send you a 6-digit
                  reset code.
                </p>
              </div>

              <div className={styles.steps}>
                <div className={`${styles.step} ${styles.stepActive}`} />
                <div className={styles.step} />
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  error={error}
                  icon={<Mail size={18} />}
                />
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={loading}>
                  Send Reset Code
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
              <p className={styles.successTitle}>Check your email!</p>
              <p className={styles.successText}>
                We sent a 6-digit OTP to <strong>{email}</strong>. It expires in
                5 minutes.
              </p>
              <Button variant="primary" onClick={goToResetPage}>
                Enter Reset Code →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.footer}>
          Remember your password?{" "}
          <Link href="/login" className={styles.link}>
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
