"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "@/styles/Modal.module.css";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const sizeClass = {
    sm: styles.modalSm,
    md: styles.modalMd,
    lg: styles.modalLg,
  }[size];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className={styles.modalContainer}>
            <motion.div
              className={`${styles.modal} ${sizeClass}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}>
              {title && (
                <div className={styles.header}>
                  <h3 className={styles.title}>{title}</h3>
                  <button
                    onClick={onClose}
                    className={styles.closeBtn}
                    aria-label="Close modal">
                    <X size={20} />
                  </button>
                </div>
              )}
              <div className={styles.content}>{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
