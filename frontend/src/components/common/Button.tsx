"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "@/styles/Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading,
  fullWidth,
  icon,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={`
        ${styles.button}
        ${styles[variant]}
        ${styles[size]}
        ${fullWidth ? styles.fullWidth : ""}
        ${isLoading ? styles.loading : ""}
        ${className}
      `}
      {...(props as any)}>
      {isLoading ? (
        <div className={styles.spinner} />
      ) : (
        icon && <span className={styles.buttonIcon}>{icon}</span>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
