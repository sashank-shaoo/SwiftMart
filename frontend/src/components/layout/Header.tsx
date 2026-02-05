"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import styles from "@/styles/Header.module.css";
import { ShoppingBag, User, LogOut, Menu, Search } from "lucide-react";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const { totalItems } = useCart();
  const { toggleCart, toggleSidebar } = useUI();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <button className={styles.iconBtn} onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <Link href={user ? "/products" : "/"}>
            <h2 className={styles.logo}>SwiftMart</h2>
          </Link>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navLinks}>
            <li>
              <Link href="/products">Shop</Link>
            </li>
            <li>
              <Link href="/products?category=electronics">Electronics</Link>
            </li>
            <li>
              <Link href="/products?category=fashion">Fashion</Link>
            </li>
          </ul>
        </nav>

        <div className={styles.actions}>
          <button className={styles.iconBtn}>
            <Search size={20} />
          </button>

          {loading ? (
            <div className={styles.loadingPulse} />
          ) : user ? (
            <div className={styles.userSection}>
              {user.role === "admin" && (
                <Link href="/admin" className={styles.adminBadge}>
                  Admin Panel
                </Link>
              )}
              <Link href="/profile" className={styles.profileLink}>
                <User size={20} />
                <span className={styles.userName}>
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

          <button className={styles.cartBtn} onClick={toggleCart}>
            <ShoppingBag size={22} />
            {totalItems > 0 && (
              <span className={styles.cartCount}>{totalItems}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
