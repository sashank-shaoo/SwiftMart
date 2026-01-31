"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

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
  React.useEffect(() => {
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
      <div className="toast-container">
        {notifications.map((n) => (
          <div key={n.id} className={`toast toast-${n.type}`}>
            {n.message}
            <button onClick={() => removeNotification(n.id)}>×</button>
          </div>
        ))}
      </div>
      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .toast {
          padding: 12px 20px;
          border-radius: 8px;
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 250px;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .toast-error {
          background: #ff4d4f;
        }
        .toast-success {
          background: #52c41a;
        }
        .toast-info {
          background: #1890ff;
        }
        .toast-warning {
          background: #faad14;
        }
        button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          margin-left: auto;
        }
      `}</style>
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
