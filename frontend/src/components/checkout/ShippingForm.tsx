"use client";

import React from "react";
import styles from "@/styles/Checkout.module.css";
import Input from "@/components/common/Input";
import { MapPin, Phone, Mail } from "lucide-react";

interface ShippingFormProps {
  formData: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

const ShippingForm: React.FC<ShippingFormProps> = ({
  formData,
  onChange,
  errors,
}) => {
  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>
        <MapPin size={20} />
        Shipping Information
      </h3>

      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            error={errors.fullName}
            placeholder="John Doe"
            required
          />
        </div>

        <div className={styles.formField}>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            error={errors.email}
            placeholder="john@example.com"
            icon={<Mail size={18} />}
            required
          />
        </div>

        <div className={styles.formField}>
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            error={errors.phone}
            placeholder="+1 (555) 000-0000"
            icon={<Phone size={18} />}
            required
          />
        </div>

        <div className={`${styles.formField} ${styles.fullWidth}`}>
          <Input
            label="Street Address"
            value={formData.address}
            onChange={(e) => onChange("address", e.target.value)}
            error={errors.address}
            placeholder="123 Main Street, Apt 4B"
            required
          />
        </div>

        <div className={styles.formField}>
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => onChange("city", e.target.value)}
            error={errors.city}
            placeholder="New York"
            required
          />
        </div>

        <div className={styles.formField}>
          <Input
            label="State/Province"
            value={formData.state}
            onChange={(e) => onChange("state", e.target.value)}
            error={errors.state}
            placeholder="NY"
            required
          />
        </div>

        <div className={styles.formField}>
          <Input
            label="ZIP/Postal Code"
            value={formData.zipCode}
            onChange={(e) => onChange("zipCode", e.target.value)}
            error={errors.zipCode}
            placeholder="10001"
            required
          />
        </div>

        <div className={styles.formField}>
          <Input
            label="Country"
            value={formData.country}
            onChange={(e) => onChange("country", e.target.value)}
            error={errors.country}
            placeholder="United States"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
