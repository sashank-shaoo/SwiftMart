"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import styles from "@/styles/Home.module.css";
import Button from "@/components/common/Button";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  Zap,
  Shield,
  Truck,
  Sparkles,
  Globe,
  Heart,
} from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/products");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div style={{ height: "100vh", display: "grid", placeItems: "center" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: 40,
            height: 40,
            border: "3px solid #6366f1",
            borderTopColor: "transparent",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className={styles.heroContent}>
          <span className={styles.badge}>Next Generation Shopping</span>
          <h1 className={styles.heroTitle}>
            Elegance in Every <span className={styles.gradientText}>Swift</span>{" "}
            Movement.
          </h1>
          <p className={styles.heroSubtitle}>
            Discover a curated collection of premium products delivered with
            lightning speed. Experience the future of luxury ecommerce today.
          </p>
          <div className={styles.heroActions}>
            <Link href="/products">
              <Button size="lg">Explore Shop</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">
                Join the Circle
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <motion.div
          className={styles.benefitGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}>
          {[
            {
              id: "fulfillment",
              icon: <Zap size={28} />,
              title: "Instant Fulfillment",
              desc: "Proprietary logistics for record-breaking speed.",
            },
            {
              id: "security",
              icon: <Shield size={28} />,
              title: "End-to-End Security",
              desc: "Bank-grade encryption on every transaction.",
            },
            {
              id: "exclusive",
              icon: <Heart size={28} />,
              title: "Member Exclusive",
              desc: "Unique benefits for our loyal community.",
            },
          ].map((item) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              whileHover={{ y: -10 }}
              className={styles.benefitCard}>
              <div className={styles.iconWrapper}>{item.icon}</div>
              <h4 className={styles.benefitTitle}>{item.title}</h4>
              <p className={styles.benefitDesc}>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </main>
  );
}
