"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const { updateLocation } = useAuth();
  const { notifyError, notifySuccess } = useNotification();

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    });
  }, []);

  const syncLocation = async () => {
    setLoading(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      await updateLocation({ latitude, longitude });
      notifySuccess("Location updated successfully");
      return { latitude, longitude };
    } catch (err: any) {
      let message = "Failed to get location";
      if (err.code === 1) message = "Location permission denied";
      else if (err.code === 2) message = "Location unavailable";
      else if (err.code === 3) message = "Location request timed out";

      notifyError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    syncLocation,
    loading,
  };
}
