"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "@/styles/OtpModal.module.css";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/common/Button";
import { Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

interface OtpModalProps {
  email: string;
  isOpen: boolean;
  onSuccess: () => void;
}

export default function OtpModal({ email, isOpen, onSuccess }: OtpModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyOtp, sendOtp } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) return;

    setLoading(true);
    try {
      await verifyOtp(email, otpValue);
      notifySuccess("Email verified successfully! Welcome aboard.");
      onSuccess();
    } catch (err: any) {
      // Error is handled by global notify, but we can clear input
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendOtp(email);
      notifySuccess("Verification code resent to your email.");
      setTimer(60);
    } catch (err) {
      notifyError("Failed to resend code. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={styles.modalContent}>
        <div className={styles.iconHeader}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, stiffness: 100 }}
            style={{
              width: "70px",
              height: "70px",
              background: "rgba(98, 159, 173, 0.1)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              color: "var(--color-primary)",
            }}>
            <Mail size={32} />
          </motion.div>
        </div>

        <h2 className={styles.title}>Check your email</h2>
        <p className={styles.subtitle}>
          We've sent a 6-digit verification code to <br />
          <b>{email}</b>. Enter it below to secure your account.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.otpGrid}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={styles.otpInput}
                disabled={loading}
              />
            ))}
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={loading}
            disabled={otp.join("").length < 6}>
            Verify Account
          </Button>
        </form>

        <div className={styles.resendSection}>
          {timer > 0 ? (
            <span>
              Resend code in <b>{timer}s</b>
            </span>
          ) : (
            <>
              Didn't receive a code?
              <button
                className={styles.resendBtn}
                onClick={handleResend}
                type="button">
                Resend now
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
