"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import styles from "@/styles/MobileMenu.module.css";
import { LogOut, User, ShoppingBag } from "lucide-react";

export default function MobileMenu() {
  const { user, logout } = useAuth();
  const { isSidebarOpen, closeSidebar } = useUI();

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            transition={{ duration: 0.2 }}>
            {/* Menu Container (Slides down) */}
            <motion.div
              className={styles.menuContainer}
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking menu
            >
              <nav>
                <ul className={styles.navLinks}>
                  <li>
                    <Link
                      href="/products"
                      className={styles.navItem}
                      onClick={closeSidebar}>
                      Shop All Products
                    </Link>
                  </li>
                  {user && (
                    <li>
                      <Link
                        href="/orders"
                        className={styles.navItem}
                        onClick={closeSidebar}>
                        My Orders
                      </Link>
                    </li>
                  )}
                  {user?.role === "seller" &&
                    user.verification_status === "verified" && (
                      <li>
                        <Link
                          href="/seller/dashboard"
                          className={styles.navItem}
                          onClick={closeSidebar}>
                          Seller Dashboard
                        </Link>
                      </li>
                    )}
                  {user?.role === "admin" && (
                    <li>
                      <Link
                        href="/admin"
                        className={styles.navItem}
                        onClick={closeSidebar}>
                        Admin Panel
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href="/cart"
                      className={styles.navItem}
                      onClick={closeSidebar}>
                      View Cart
                    </Link>
                  </li>
                </ul>
              </nav>

              <div className={styles.userActions}>
                {user ? (
                  <React.Fragment>
                    <Link
                      href="/profile"
                      className={styles.profileLink}
                      onClick={closeSidebar}>
                      <User size={20} />
                      <span>{user.name}</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        closeSidebar();
                      }}
                      className={styles.logoutBtn}>
                      <LogOut size={18} />
                      Logout
                    </button>
                  </React.Fragment>
                ) : (
                  <Link
                    href="/login"
                    className={styles.loginBtn}
                    onClick={closeSidebar}>
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
