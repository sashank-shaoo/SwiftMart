"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "@/styles/Checkout.module.css";
import { Check } from "lucide-react";

interface CheckoutStepsProps {
  currentStep: number;
  steps: string[];
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className={styles.stepsContainer}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={index} className={styles.stepWrapper}>
            <div className={styles.stepIndicator}>
              <motion.div
                className={`${styles.stepCircle} ${
                  isCompleted
                    ? styles.stepCompleted
                    : isCurrent
                      ? styles.stepActive
                      : styles.stepPending
                }`}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}>
                {isCompleted ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </motion.div>
              <span
                className={`${styles.stepLabel} ${
                  isCurrent ? styles.stepLabelActive : ""
                }`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={styles.stepConnector}>
                <motion.div
                  className={styles.stepConnectorFill}
                  initial={false}
                  animate={{
                    scaleX: isCompleted ? 1 : 0,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutSteps;
