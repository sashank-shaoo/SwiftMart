"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { User, Mail, Lock, Gift, UserCircle } from "lucide-react";
import styles from "@/styles/register.module.css";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "user" | "seller",
    referral_code: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(formData);
      notifySuccess("Account created successfully! Welcome to SwiftMart.");
      router.push("/");
    } catch (err: any) {
      // Notification is already handled by Global Error Handler in apiClient
      // But we can add specific logic here if needed
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
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
            onClick={() => setFormData((prev) => ({ ...prev, role: "user" }))}>
            Shopper
          </button>
          <button
            type="button"
            className={`${styles.roleBtn} ${formData.role === "seller" ? styles.roleBtnActive : ""}`}
            onClick={() =>
              setFormData((prev) => ({ ...prev, role: "seller" }))
            }>
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
