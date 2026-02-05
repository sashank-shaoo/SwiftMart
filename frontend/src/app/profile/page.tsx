"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import styles from "@/styles/Profile.module.css";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import {
  User,
  Settings,
  Package,
  MapPin,
  ShieldCheck,
  Mail,
  Calendar,
  Phone,
  Lock,
  Save,
  Navigation,
  CheckCircle2,
  Camera,
  Store,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type TabType = "personal" | "orders" | "address" | "security" | "seller";

export default function ProfilePage() {
  const {
    user,
    loading,
    updateUser,
    updateLocation,
    changePassword,
    becomeSeller,
  } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [profileForm, setProfileForm] = useState({
    name: "",
    number: "",
  });

  const [securityForm, setSecurityForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [sellerForm, setSellerForm] = useState({
    store_name: "",
    gst_number: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
  });
  // ... (omitting unchanged useEffects for now to keep chunks clear, but I'll update them in the next call if needed)

  const handleBecomeSeller = async (e: React.FormEvent) => {
    e.preventDefault();
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
      notifySuccess("Application submitted successfully!");
      setActiveTab("personal");
    } catch (err: any) {
      console.error("Seller Application Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (user) {
      setProfileForm({
        name: user.name || "",
        number: user.number || "",
      });
    }
  }, [user, loading, router]);

  // Initial Mapbox Load
  useEffect(() => {
    if (activeTab === "address" && user?.location && mapRef.current) {
      const [lng, lat] = user.location.coordinates;

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new mapboxgl.Map({
          container: mapRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [lng, lat],
          zoom: 12,
        });

        const marker = new mapboxgl.Marker({
          color: "var(--color-primary-dark)",
        })
          .setLngLat([lng, lat])
          .addTo(mapInstanceRef.current);
      } else {
        mapInstanceRef.current.flyTo({ center: [lng, lat] });
      }
    }

    return () => {
      // We don't necessarily want to destroy on every re-render,
      // but maybe when switching tabs if needed for performance.
    };
  }, [activeTab, user?.location]);

  if (loading || !user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}>
        <p>Loading your profile...</p>
      </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateUser(profileForm);
      notifySuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Profile update error:", err);
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
      await updateUser(formData);
      notifySuccess("Profile photo updated!");
    } catch (err: any) {
      console.error("Photo upload error:", err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityForm.new_password !== securityForm.confirm_password) {
      return notifyError("New passwords do not match.");
    }
    setIsSubmitting(true);
    try {
      await changePassword({
        old_password: securityForm.old_password,
        new_password: securityForm.new_password,
      });
      notifySuccess("Password changed successfully!");
      setSecurityForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err: any) {
      console.error("Password change error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      return notifyError("Geolocation is not supported by your browser.");
    }

    setIsSubmitting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await updateLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          notifySuccess("Location updated based on your current position!");
        } catch (err) {
          notifyError("Failed to update location.");
        } finally {
          setIsSubmitting(false);
        }
      },
      (error) => {
        notifyError("Error getting location: " + error.message);
        setIsSubmitting(false);
      },
    );
  };

  const menuItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "personal", label: "Account Overview", icon: <User size={20} /> },
    { id: "orders", label: "My Orders", icon: <Package size={20} /> },
    { id: "address", label: "Shipping & Location", icon: <MapPin size={20} /> },
    {
      id: "security",
      label: "Security & Settings",
      icon: <Settings size={20} />,
    },
    ...(user.role === "user"
      ? ([
          { id: "seller", label: "Become a Seller", icon: <Store size={20} /> },
        ] as any)
      : []),
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                  <ShieldCheck size={24} color="var(--color-primary)" />
                  Personal Information
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>

              {!isEditing ? (
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Full Name</span>
                    <span className={styles.value}>
                      {user.name || "Not provided"}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Email Address</span>
                    <span className={styles.value}>{user.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Phone Number</span>
                    <span className={styles.value}>
                      {user.number || "Not provided"}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Member Since</span>
                    <span className={styles.value}>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "Founding Member"}
                    </span>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleProfileUpdate}
                  className={styles.formGroup}>
                  <Input
                    label="Full Name"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                  />
                  <Input
                    label="Phone Number"
                    value={profileForm.number}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, number: e.target.value })
                    }
                    placeholder="e.g. +1234567890"
                  />
                  <div className={styles.formActions}>
                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      icon={<Save size={18} />}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        );

      case "address":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}>
                <Navigation size={24} color="var(--color-primary)" />
                Delivery Location
              </h3>

              <div className={styles.locationCard}>
                <p
                  style={{
                    marginBottom: "1rem",
                    color: "var(--color-secondary)",
                  }}>
                  Your delivery coordinates help us calculate shipping costs and
                  speed accurately.
                </p>
                {user.location ? (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Active Coordinates</span>
                    <div style={{ marginTop: "0.5rem" }}>
                      <span className={styles.coordinates}>
                        LAT: {user.location.coordinates[1].toFixed(6)}
                      </span>
                      <span
                        className={styles.coordinates}
                        style={{ marginLeft: "1rem" }}>
                        LNG: {user.location.coordinates[0].toFixed(6)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <MapPin size={48} opacity={0.3} />
                    <p>No location data detected yet.</p>
                  </div>
                )}

                <div className={styles.mapPlaceholder}>
                  <div ref={mapRef} className={styles.mapContainer} />
                </div>

                <div className={styles.btnRow}>
                  <Button
                    onClick={handleSetCurrentLocation}
                    isLoading={isSubmitting}
                    variant="primary"
                    icon={<Navigation size={18} />}>
                    Update with Current GPS
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case "security":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}>
                <Lock size={24} color="var(--color-primary)" />
                Security Settings
              </h3>

              <form
                onSubmit={handlePasswordChange}
                className={styles.formGroup}>
                <Input
                  label="Current Password"
                  type="password"
                  value={securityForm.old_password}
                  onChange={(e) =>
                    setSecurityForm({
                      ...securityForm,
                      old_password: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={securityForm.new_password}
                  onChange={(e) =>
                    setSecurityForm({
                      ...securityForm,
                      new_password: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={securityForm.confirm_password}
                  onChange={(e) =>
                    setSecurityForm({
                      ...securityForm,
                      confirm_password: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                />
                <div className={styles.formActions}>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    variant="primary">
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        );

      case "orders":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}>
                <Package size={24} color="var(--color-primary)" />
                Order History
              </h3>
              <div className={styles.emptyState}>
                <Package size={48} opacity={0.3} />
                <p>
                  You haven't placed any orders yet. Experience the speed of
                  SwiftMart today!
                </p>
                <Button
                  style={{ marginTop: "1rem" }}
                  onClick={() => router.push("/products")}>
                  Start Shopping
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case "seller":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}>
                <Store size={24} color="var(--color-primary)" />
                Seller Application
              </h3>

              <p className={styles.sectionDescription}>
                Ready to reach thousands of customers? Fill out the details
                below to apply for a seller account.
              </p>

              <form onSubmit={handleBecomeSeller} className={styles.formGroup}>
                <Input
                  label="Store Name"
                  value={sellerForm.store_name}
                  onChange={(e) =>
                    setSellerForm({ ...sellerForm, store_name: e.target.value })
                  }
                  placeholder="e.g. SwiftMart Premium Boutique"
                  required
                />
                <Input
                  label="GST Number (Optional)"
                  value={sellerForm.gst_number}
                  onChange={(e) =>
                    setSellerForm({ ...sellerForm, gst_number: e.target.value })
                  }
                  placeholder="e.g. 22AAAAA0000A1Z5"
                />

                <h4 className={styles.subSectionTitle}>Payout Details</h4>
                <div className={styles.infoGrid}>
                  <Input
                    label="Bank Name"
                    value={sellerForm.bank_name}
                    onChange={(e) =>
                      setSellerForm({
                        ...sellerForm,
                        bank_name: e.target.value,
                      })
                    }
                    placeholder="e.g. Global Bank"
                    required
                  />
                  <Input
                    label="Account Number"
                    value={sellerForm.account_number}
                    onChange={(e) =>
                      setSellerForm({
                        ...sellerForm,
                        account_number: e.target.value,
                      })
                    }
                    placeholder="Enter account number"
                    required
                  />
                  <Input
                    label="IFSC Code"
                    value={sellerForm.ifsc_code}
                    onChange={(e) =>
                      setSellerForm({
                        ...sellerForm,
                        ifsc_code: e.target.value,
                      })
                    }
                    placeholder="e.g. GLO0001234"
                    required
                  />
                </div>

                <div
                  className={styles.formActions}
                  style={{ marginTop: "2rem" }}>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    variant="primary"
                    fullWidth
                    icon={<CheckCircle2 size={18} />}>
                    Submit Application
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.profileHeaderSpacer} />
      <div className={styles.profileLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.profileCard}>
            <div
              className={styles.avatarWrapper}
              onClick={() => fileInputRef.current?.click()}>
              {isUploadingAvatar && (
                <div className={styles.avatarLoadingOverlay}>
                  <div className={styles.loadingSpinner} />
                </div>
              )}
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className={styles.profileImage}
                />
              ) : (
                (user.name || "User").charAt(0).toUpperCase()
              )}
              <div className={styles.avatarUploadOverlay}>
                <Camera size={20} />
                <span>Upload</span>
              </div>
              {user.is_verified_email && (
                <div className={styles.verifiedBadge}>
                  <CheckCircle2 color="#22c55e" size={18} fill="white" />
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleImageUpload}
            />
            <h2 className={styles.userName}>{user.name || "SwiftMart User"}</h2>
            <p className={styles.userEmail}>{user.email}</p>
            <span
              className={`${styles.roleBadge} ${user.role === "seller" ? styles.roleSeller : styles.roleUser}`}>
              {user.role} Member
            </span>
          </div>

          <nav className={styles.sidebarNav}>
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ""}`}>
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={styles.mainBlock}>
          <AnimatePresence mode="wait">{renderTabContent()}</AnimatePresence>
        </main>
      </div>
    </div>
  );
}
