"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type TabType =
  | "personal"
  | "orders"
  | "address"
  | "security"
  | "seller"
  | "seller_settings";

export function useProfile() {
  const router = useRouter();
  const {
    user,
    loading,
    updateUser,
    updateLocation,
    changePassword,
    becomeSeller,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

  // Security form state
  const [securityForm, setSecurityForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Seller application form state
  const [sellerForm, setSellerForm] = useState({
    store_name: "",
    gst_number: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
  });

  // Auth guard
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  // Mapbox init / update on tab change
  useEffect(() => {
    // User delivery location
    if (activeTab === "address" && user?.location && mapRef.current) {
      const [lng, lat] = user.location.coordinates;
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new mapboxgl.Map({
          container: mapRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [lng, lat],
          zoom: 12,
        });
        new mapboxgl.Marker({ color: "var(--color-primary-dark)" })
          .setLngLat([lng, lat])
          .addTo(mapInstanceRef.current);
      } else {
        mapInstanceRef.current.flyTo({ center: [lng, lat] });
      }
    }

    // Seller warehouse location
    if (
      activeTab === "seller_settings" &&
      user?.seller_profile?.warehouse_location &&
      mapRef.current
    ) {
      const [lng, lat] = user.seller_profile.warehouse_location.coordinates;
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new mapboxgl.Map({
          container: mapRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [lng, lat],
          zoom: 12,
        });
        new mapboxgl.Marker({ color: "#ea580c" })
          .setLngLat([lng, lat])
          .addTo(mapInstanceRef.current);
      } else {
        mapInstanceRef.current.flyTo({ center: [lng, lat] });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab, user?.location, user?.seller_profile?.warehouse_location]);

  /* ── Handlers ── */

  const handleProfileUpdate = async (data: Partial<User> | FormData) => {
    setIsSubmitting(true);
    try {
      await updateUser(data as any);
      return true;
    } catch {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setIsUploadingAvatar(true);
    try {
      await updateUser(formData as any);
      return true;
    } catch {
      return false;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleBecomeSeller = async (): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await becomeSeller({
        store_name: sellerForm.store_name,
        gst_number: sellerForm.gst_number,
        payout_details: {
          bank_name: sellerForm.bank_name,
          account_number: sellerForm.account_number,
          ifsc_code: sellerForm.ifsc_code,
        },
      });
      setActiveTab("personal");
      return true;
    } catch {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (): Promise<boolean | string> => {
    if (securityForm.new_password !== securityForm.confirm_password) {
      return "New passwords do not match.";
    }
    setIsSubmitting(true);
    try {
      await changePassword({
        current_password: securityForm.current_password, // ✅ fixed field name
        new_password: securityForm.new_password,
      });
      setSecurityForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      return true;
    } catch (err: any) {
      return err?.message || "Failed to change password.";
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetCurrentLocation = async (): Promise<boolean | string> => {
    if (!navigator.geolocation) {
      return "Geolocation is not supported by your browser.";
    }
    return new Promise((resolve) => {
      setIsSubmitting(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await updateLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            resolve(true);
          } catch {
            resolve("Failed to update location.");
          } finally {
            setIsSubmitting(false);
          }
        },
        (err) => {
          setIsSubmitting(false);
          resolve("Error getting location: " + err.message);
        },
      );
    });
  };

  const handleSetWarehouseLocation = async (): Promise<boolean | string> => {
    if (!navigator.geolocation) {
      return "Geolocation is not supported by your browser.";
    }
    return new Promise((resolve) => {
      setIsSubmitting(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await updateUser({
              warehouse_location: {
                type: "Point",
                coordinates: [
                  position.coords.longitude,
                  position.coords.latitude,
                ],
              },
            } as any);
            resolve(true);
          } catch {
            resolve("Failed to update warehouse location.");
          } finally {
            setIsSubmitting(false);
          }
        },
        (err) => {
          setIsSubmitting(false);
          resolve("Error getting location: " + err.message);
        },
      );
    });
  };

  return {
    user,
    loading,
    activeTab,
    setActiveTab,
    isSubmitting,
    isUploadingAvatar,
    mapRef,
    securityForm,
    setSecurityForm,
    sellerForm,
    setSellerForm,
    logout,
    handleProfileUpdate,
    handleImageUpload,
    handleBecomeSeller,
    handlePasswordChange,
    handleSetCurrentLocation,
    handleSetWarehouseLocation,
  };
}
