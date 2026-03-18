"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import styles from "@/styles/Header.module.css";
import { ShoppingBag, User, LogOut, Menu, Search } from "lucide-react";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const { totalItems } = useCart();
  const { toggleCart, toggleSidebar } = useUI(); // Keep toggleCart as it's not explicitly removed and might be used elsewhere
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const handleSearch = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Mobile Search Overlay */}
        <div
          className={`${styles.mobileSearchOverlay} ${isMobileSearchOpen ? styles.active : ""}`}>
          <form onSubmit={handleSearch} className={styles.mobileSearchForm}>
            <Search size={20} className={styles.mobileSearchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.mobileSearchInput}
              autoFocus={isMobileSearchOpen}
            />
            <button
              type="button"
              className={styles.closeSearchBtn}
              onClick={() => setIsMobileSearchOpen(false)}>
              Cancel
            </button>
          </form>
        </div>

        {/* Regular Header Content */}
        <div
          className={`${styles.headerContent} ${isMobileSearchOpen ? styles.hidden : ""}`}>
          <div className={styles.leftSection}>
            <button className={styles.menuBtn} onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <Link href={user ? "/products" : "/"} className={styles.logoLink}>
              <h2 className={styles.logo}>SwiftMart</h2>
            </Link>
          </div>

          <div className={styles.searchSection}>
            <form onSubmit={handleSearch} className={styles.desktopSearchForm}>
              <div className={styles.searchWrapper}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            </form>
          </div>

          <nav className={styles.nav}>
            <ul className={styles.navLinks}>
              <li>
                <Link href="/products">Shop</Link>
              </li>
              {user && (
                <li className={styles.hiddenOnMobile}>
                  <Link href="/orders">My Orders</Link>
                </li>
              )}
            </ul>
          </nav>

          <div className={styles.actions}>
            <button
              className={styles.mobileSearchTrigger}
              onClick={() => setIsMobileSearchOpen(true)}>
              <Search size={24} />
            </button>

            {loading ? (
              <div className={styles.loadingPulse} />
            ) : user ? (
              <div className={styles.userSection}>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className={`${styles.adminBadge} ${styles.hiddenOnMobile}`}>
                    Admin
                  </Link>
                )}
                {user.role === "seller" &&
                  user.verification_status === "verified" && (
                    <Link
                      href="/seller/dashboard"
                      className={`${styles.sellerBadge} ${styles.hiddenOnMobile}`}>
                      Store
                    </Link>
                  )}
                <Link href="/profile" className={styles.profileLink}>
                  <User size={20} />
                  <span
                    className={`${styles.userName} ${styles.hiddenOnMobile}`}>
                    {user?.name?.split(" ")[0]}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className={styles.iconBtn}
                  title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link href="/login" className={styles.authLink}>
                Login
              </Link>
            )}

            <Link href="/cart" className={styles.cartBtn}>
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className={styles.cartCount}>{totalItems}</span>
              )}
            </Link>
          </div>
        </div>
      </div>
      <MobileMenu />
    </header>
  );
}
