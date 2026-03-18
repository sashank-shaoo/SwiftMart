"use client";

import React, { useState } from "react";
import styles from "@/styles/AccountOverview.module.css";
import { User } from "@/types";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Hash,
  FileText,
  Edit2,
  Save,
  X,
} from "lucide-react";
import Button from "@/components/common/Button";

interface AccountOverviewProps {
  user: User;
  onUpdate: (data: Partial<User>) => Promise<void>;
}

const AccountOverview: React.FC<AccountOverviewProps> = ({
  user,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    number: user.number || "",
    age: user.age || "",
    bio: user.bio || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate({
        ...formData,
        age: formData.age ? Number(formData.age) : undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overviewContainer}>
      <div className={styles.sectionCard}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>
            <UserIcon size={24} className="text-primary" />
            Personal Information
          </h3>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              icon={<Edit2 size={16} />}
              onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        {!isEditing ? (
          <div className={styles.grid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Full Name</span>
              <span className={styles.value}>{user.name}</span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Email Address</span>
              <span
                className={styles.value}
                style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={16} color="#64748B" />
                {user.email}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Phone Number</span>
              <span className={styles.value}>
                {user.number || "Not provided"}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Age</span>
              <span className={styles.value}>
                {user.age ? `${user.age} years old` : "Not provided"}
              </span>
            </div>

            <div className={`${styles.infoItem} ${styles.fullWidth}`}>
              <span className={styles.label}>Bio</span>
              <span className={styles.value}>
                {user.bio || "Tell us a bit about yourself..."}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.label}>Member Since</span>
              <span
                className={styles.value}
                style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={16} color="#64748B" />
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Full Name</label>
              <input
                className={styles.input}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Phone Number</label>
              <input
                className={styles.input}
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: e.target.value })
                }
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Age</label>
              <input
                type="number"
                className={styles.input}
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                placeholder="Ex. 25"
                min="13"
                max="120"
              />
            </div>

            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Bio</label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Share a little about yourself..."
              />
            </div>

            <div className={`${styles.actions} ${styles.fullWidth}`}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                icon={<Save size={18} />}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AccountOverview;
