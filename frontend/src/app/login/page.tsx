"use client";

import React from "react";
import { useLogin } from "@/hooks/useAuthForms";
import { useNotification } from "@/context/NotificationContext";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { Mail, Lock } from "lucide-react";
import styles from "@/styles/login.module.css";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { notifySuccess } = useNotification();
  const { formData, errors, loading, handleChange, submit } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok) notifySuccess("Welcome back to SwiftMart!");
  };

  return (
    <div className={styles.pageWrapper}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome</h1>
          <p className={styles.subtitle}>Log in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<Mail size={18} />}
          />

          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={<Lock size={18} />}
            />
            <Link href="/forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Log In
          </Button>
        </form>

        <div className={styles.footer}>
          Don't have an account?{" "}
          <Link href="/register" className={styles.link}>
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
