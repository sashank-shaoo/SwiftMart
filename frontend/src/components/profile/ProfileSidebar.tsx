"use client";

import React, { useRef, useState } from "react";
import styles from "@/styles/ProfileSidebar.module.css";
import { User } from "@/types";
import {
  User as UserIcon,
  Package,
  MapPin,
  Settings,
  Store,
  Camera,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileSidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  onLogout?: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  user,
  activeTab,
  onTabChange,
  onImageUpload,
  isUploading,
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // React.useEffect(() => {
  //   console.log("DEBUG: ProfileSidebar user prop updated:", user);
  // }, [user]);

  const menuItems = [
    { id: "personal", label: "Account Overview", icon: <UserIcon size={20} /> },
    { id: "orders", label: "My Orders", icon: <Package size={20} /> },
    { id: "address", label: "Address Book", icon: <MapPin size={20} /> },
    { id: "security", label: "Settings", icon: <Settings size={20} /> },
  ];

  if (user.role === "seller") {
    menuItems.push({
      id: "seller_settings",
      label: "Seller Dashboard",
      icon: <Store size={20} />,
    });
  } else {
    menuItems.push({
      id: "seller",
      label: "Become a Seller",
      icon: <Store size={20} />,
    });
  }

  const SidebarContent = () => (
    <>
      <div className={styles.userProfile}>
        <div
          className={styles.avatarWrapper}
          onClick={() => fileInputRef.current?.click()}>
          {user.image ? (
            <img src={user.image} alt={user.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div className={styles.cameraIcon}>
            <Camera size={16} />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={onImageUpload}
          />
        </div>
        <h3 className={styles.userName}>{user.name}</h3>
        <p className={styles.userEmail}>{user.email}</p>
        <span
          className={`${styles.roleBadge} ${
            user.role === "seller" ? styles.sellerRole : styles.userRole
          }`}>
          {user.role} Account
        </span>
      </div>

      <nav className={styles.navMenu}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              setIsMobileOpen(false);
            }}
            className={`${styles.navItem} ${
              activeTab === item.id ? styles.activeItem : ""
            }`}>
            {item.icon}
            {item.label}
          </button>
        ))}

        {onLogout && (
          <button
            onClick={onLogout}
            className={styles.navItem}
            style={{ marginTop: "auto", color: "#ef4444" }}>
            <LogOut size={20} />
            Log Out
          </button>
        )}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebarContainer}>
        <SidebarContent />
      </aside>

      {/* Mobile Toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setIsMobileOpen(true)}>
        <Menu size={24} />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.mobileOverlay}
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={styles.mobileDrawer}>
              <button
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748B",
                }}
                onClick={() => setIsMobileOpen(false)}>
                <X size={24} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProfileSidebar;
