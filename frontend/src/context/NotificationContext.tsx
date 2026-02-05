"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import styles from "@/styles/Notification.module.css";

export type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  notifications: Notification[];
  notify: (type: NotificationType, message: string) => void;
  notifyError: (message: string) => void;
  notifySuccess: (message: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

// Global event bus for non-react usage (e.g. apiClient)
type NotificationEvent = { type: NotificationType; message: string };
const notificationEvents: ((event: NotificationEvent) => void)[] = [];

export const globalNotify = (type: NotificationType, message: string) => {
  notificationEvents.forEach((cb) => cb({ type, message }));
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (type: NotificationType, message: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setNotifications((prev) => [...prev, { id, type, message }]);

      // Auto-remove after 5 seconds
      setTimeout(() => removeNotification(id), 5000);
    },
    [removeNotification],
  );

  const notifyError = useCallback(
    (message: string) => notify("error", message),
    [notify],
  );
  const notifySuccess = useCallback(
    (message: string) => notify("success", message),
    [notify],
  );

  // Listen to global events
  useEffect(() => {
    const handleGlobalEvent = (event: NotificationEvent) => {
      notify(event.type, event.message);
    };
    notificationEvents.push(handleGlobalEvent);
    return () => {
      const index = notificationEvents.indexOf(handleGlobalEvent);
      if (index > -1) notificationEvents.splice(index, 1);
    };
  }, [notify]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        notify,
        notifyError,
        notifySuccess,
        removeNotification,
      }}>
      {children}
      {/* Toast Render Area */}
      <div className={styles.toastContainer}>
        {notifications.map((n) => (
          <div key={n.id} className={`${styles.toast} ${styles[n.type]}`}>
            {n.message}
            <button
              className={styles.closeBtn}
              onClick={() => removeNotification(n.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
}
