"use client";

import React from "react";
import { useRegister } from "@/hooks/useAuthForms";
import { useNotification } from "@/context/NotificationContext";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { User, Mail, Lock, Gift } from "lucide-react";
import styles from "@/styles/register.module.css";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const { notifySuccess } = useNotification();
  const { formData, errors, loading, handleChange, setRole, submit } =
    useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok)
      notifySuccess("Account created successfully! Welcome to SwiftMart.");
  };

  return (
    <div className={styles.pageWrapper}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.registerCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>SwiftMart</h1>
          <p className={styles.subtitle}>Create your premium account</p>
        </div>

        <div className={styles.roleToggle}>
          <button
            type="button"
            className={`${styles.roleBtn} ${formData.role === "user" ? styles.roleBtnActive : ""}`}
            onClick={() => setRole("user")}>
            Shopper
          </button>
          <button
            type="button"
            className={`${styles.roleBtn} ${formData.role === "seller" ? styles.roleBtnActive : ""}`}
            onClick={() => setRole("seller")}>
            Seller
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Full Name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            icon={<User size={18} />}
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={<Mail size={18} />}
          />
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
          <Input
            label="Referral Code (Optional)"
            name="referral_code"
            placeholder="WELCOME20"
            value={formData.referral_code}
            onChange={handleChange}
            icon={<Gift size={18} />}
          />

          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Create Account
          </Button>
        </form>

        <div className={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" className={styles.link}>
            Login here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
