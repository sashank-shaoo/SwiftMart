"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { adminService } from "@/services/adminService";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/common/Button";
import {
  User,
  Store,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Mail,
  Calendar,
} from "lucide-react";

interface PendingSeller {
  id: string;
  name: string;
  email: string;
  store_name?: string;
  gst_number?: string;
  verification_status: string;
  created_at: string;
}

export default function AdminSellersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [pendingSellers, setPendingSellers] = useState<PendingSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "admin") {
      router.push("/");
      notifyError("Access denied. Admin privileges required.");
      return;
    }
    fetchPendingSellers();
  }, [user, authLoading, router]);

  const fetchPendingSellers = async () => {
    setLoading(true);
    try {
      // Fetch pending sellers directly from database
      const data = await adminService.getPendingSellers();
      console.log("📋 Pending sellers from API:", data);

      setPendingSellers(data.pendingSellers || []);
    } catch (error: any) {
      console.error("Error fetching pending sellers:", error);
      notifyError(error.message || "Failed to load pending sellers");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (sellerId: string) => {
    console.log("🔍 Attempting to approve seller with ID:", sellerId);

    setProcessingId(sellerId);
    try {
      await adminService.approveSeller(sellerId);
      notifySuccess(
        "Seller approved! They need to logout and login again to access their dashboard.",
      );
      fetchPendingSellers();
    } catch (error: any) {
      console.error("❌ Approval failed:", error);
      notifyError(error.message || "Failed to approve seller");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (sellerId: string) => {
    if (!confirm("Are you sure you want to reject this seller application?")) {
      return;
    }

    setProcessingId(sellerId);
    try {
      // You'll need to add a reject endpoint
      notifySuccess("Seller rejected");
      fetchPendingSellers();
    } catch (error: any) {
      notifyError(error.message || "Failed to reject seller");
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner fullPage size="lg" />;
  }

  return (
    <main className={styles.container}>
      <div className={styles.backButton}>
        <Link href="/admin">
          <Button variant="outline" size="sm" icon={<ArrowLeft size={16} />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Seller Approvals</h1>
          <p className={styles.subtitle}>
            Review and approve pending seller applications
          </p>
        </div>
      </div>

      {pendingSellers.length === 0 ? (
        <div className={styles.emptyState}>
          <CheckCircle size={80} strokeWidth={1.5} color="#10b981" />
          <h2>All Caught Up!</h2>
          <p>No pending seller applications at this time.</p>
        </div>
      ) : (
        <div className={styles.sellersList}>
          {pendingSellers.map((seller) => (
            <div key={seller.id} className={styles.sellerCard}>
              <div className={styles.sellerHeader}>
                <div className={styles.sellerInfo}>
                  <div className={styles.avatarPlaceholder}>
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className={styles.sellerName}>{seller.name}</h3>
                    <div className={styles.sellerEmail}>
                      <Mail size={14} />
                      <span>{seller.email}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.statusBadge}>
                  <Clock size={16} />
                  {seller.verification_status}
                </div>
              </div>

              <div className={styles.sellerDetails}>
                <div className={styles.detailRow}>
                  <Store size={18} color="#6366f1" />
                  <div>
                    <span className={styles.detailLabel}>Store Name</span>
                    <span className={styles.detailValue}>
                      {seller.store_name || "Not provided"}
                    </span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <div style={{ marginLeft: "28px" }}>
                    <span className={styles.detailLabel}>GST Number</span>
                    <span className={styles.detailValue}>
                      {seller.gst_number || "Not provided"}
                    </span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <Calendar size={18} color="#6366f1" />
                  <div>
                    <span className={styles.detailLabel}>Applied On</span>
                    <span className={styles.detailValue}>
                      {new Date(seller.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.sellerActions}>
                <Button
                  variant="primary"
                  onClick={() => handleApprove(seller.id)}
                  isLoading={processingId === seller.id}
                  disabled={processingId !== null}
                  icon={<CheckCircle size={18} />}
                  style={{ background: "#10b981", borderColor: "#10b981" }}>
                  Approve Seller
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(seller.id)}
                  disabled={processingId !== null}
                  icon={<XCircle size={18} />}
                  style={{ color: "#ef4444", borderColor: "#ef4444" }}>
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
