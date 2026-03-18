"use client";

import React from "react";
import styles from "@/styles/LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  fullPage = false,
}) => {
  const sizeClass = {
    sm: styles.small,
    md: styles.medium,
    lg: styles.large,
  }[size];

  const content = (
    <div className={`${styles.spinner} ${sizeClass}`}>
      <div className={styles.spinnerRing}></div>
    </div>
  );

  if (fullPage) {
    return <div className={styles.fullPageContainer}>{content}</div>;
  }

  return content;
};

export default LoadingSpinner;
