"use client";

import { useRouter } from "next/navigation";
import { useNotification } from "@/context/NotificationContext";
import styles from "@/styles/Profile.module.css";
import { motion } from "framer-motion";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import {
  Package,
  MapPin,
  Lock,
  Navigation,
  CheckCircle2,
  Store,
} from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import AccountOverview from "@/components/profile/AccountOverview";
import { useProfile } from "@/hooks/useProfile";

export default function ProfilePage() {
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();
  const {
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
  } = useProfile();

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

  const onProfileUpdate = async (data: any) => {
    const ok = await handleProfileUpdate(data);
    if (ok) notifySuccess("Profile updated successfully!");
    else notifyError("Failed to update profile.");
  };

  const onPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handlePasswordChange();
    if (result === true) notifySuccess("Password changed successfully!");
    else if (typeof result === "string") notifyError(result);
  };

  const onSetCurrentLocation = async () => {
    const result = await handleSetCurrentLocation();
    if (result === true)
      notifySuccess("Location updated based on your current position!");
    else if (typeof result === "string") notifyError(result);
  };

  const onSetWarehouseLocation = async () => {
    const result = await handleSetWarehouseLocation();
    if (result === true)
      notifySuccess("Warehouse location updated successfully!");
    else if (typeof result === "string") notifyError(result);
  };

  const onBecomeSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await handleBecomeSeller();
    if (ok) notifySuccess("Application submitted successfully!");
    else notifyError("Failed to submit application.");
  };

  const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const ok = await handleImageUpload(e);
    if (ok) notifySuccess("Profile photo updated!");
    else notifyError("Failed to upload photo.");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.tabContent}>
            <AccountOverview user={user} onUpdate={onProfileUpdate} />
          </motion.div>
        );

      case "address":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
                    onClick={onSetCurrentLocation}
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}>
                <Lock size={24} color="var(--color-primary)" />
                Security Settings
              </h3>
              <form onSubmit={onPasswordChange} className={styles.formGroup}>
                <Input
                  label="Current Password"
                  type="password"
                  value={securityForm.current_password}
                  onChange={(e) =>
                    setSecurityForm({
                      ...securityForm,
                      current_password: e.target.value,
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
              <form onSubmit={onBecomeSeller} className={styles.formGroup}>
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

      case "seller_settings":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.tabContent}>
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}>
                <Store size={24} color="var(--color-primary)" />
                Seller Settings
              </h3>
              <p className={styles.sectionDescription}>
                Manage your warehouse location for delivery calculations.
              </p>
              <div className={styles.locationCard}>
                <h4 style={{ marginBottom: "1rem", fontWeight: 600 }}>
                  📍 Warehouse Location
                </h4>
                {user.seller_profile?.warehouse_location ? (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Current Coordinates</span>
                    <div style={{ marginTop: "0.5rem" }}>
                      <span className={styles.coordinates}>
                        LAT:{" "}
                        {user.seller_profile.warehouse_location.coordinates[1].toFixed(
                          6,
                        )}
                      </span>
                      <span
                        className={styles.coordinates}
                        style={{ marginLeft: "1rem" }}>
                        LNG:{" "}
                        {user.seller_profile.warehouse_location.coordinates[0].toFixed(
                          6,
                        )}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <MapPin size={48} opacity={0.3} />
                    <p>No warehouse location set yet.</p>
                  </div>
                )}
                <div className={styles.mapPlaceholder}>
                  <div ref={mapRef} className={styles.mapContainer} />
                </div>
                <div className={styles.btnRow}>
                  <Button
                    onClick={onSetWarehouseLocation}
                    isLoading={isSubmitting}
                    variant="primary"
                    icon={<Navigation size={18} />}>
                    Set Warehouse Location
                  </Button>
                </div>
                {user.seller_profile?.warehouse_location && (
                  <p
                    style={{
                      marginTop: "1rem",
                      fontSize: "0.875rem",
                      color: "#666",
                    }}>
                    ✓ This location will be used to calculate delivery distance
                    and estimated times when you ship orders.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className={styles.profileWrapper}>
      <div className={styles.profileHeaderSpacer} />
      <div className={styles.profileLayout}>
        <ProfileSidebar
          user={user}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as any)}
          onImageUpload={onImageUpload}
          isUploading={isUploadingAvatar}
          onLogout={logout}
        />
        <div className={styles.mainBlock}>{renderTabContent()}</div>
      </div>
    </div>
  );
}
