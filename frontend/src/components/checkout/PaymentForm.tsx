"use client";

import React, { useState } from "react";
import styles from "@/styles/Checkout.module.css";
import Input from "@/components/common/Input";
import { CreditCard, Wallet, Smartphone } from "lucide-react";

interface PaymentFormProps {
  formData: {
    paymentMethod: "card" | "upi" | "wallet";
    cardNumber?: string;
    cardName?: string;
    expiryDate?: string;
    cvv?: string;
    upiId?: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  formData,
  onChange,
  errors,
}) => {
  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: <CreditCard size={20} /> },
    { id: "upi", name: "UPI", icon: <Smartphone size={20} /> },
    { id: "wallet", name: "Digital Wallet", icon: <Wallet size={20} /> },
  ];

  return (
    <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>
        <CreditCard size={20} />
        Payment Method
      </h3>

      <div className={styles.paymentMethods}>
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            className={`${styles.paymentMethod} ${
              formData.paymentMethod === method.id
                ? styles.paymentMethodActive
                : ""
            }`}
            onClick={() => onChange("paymentMethod", method.id)}>
            {method.icon}
            <span>{method.name}</span>
          </button>
        ))}
      </div>

      {formData.paymentMethod === "card" && (
        <div className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.fullWidth}`}>
            <Input
              label="Card Number"
              value={formData.cardNumber || ""}
              onChange={(e) => onChange("cardNumber", e.target.value)}
              error={errors.cardNumber}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </div>

          <div className={styles.formField}>
            <Input
              label="Cardholder Name"
              value={formData.cardName || ""}
              onChange={(e) => onChange("cardName", e.target.value)}
              error={errors.cardName}
              placeholder="JOHN DOE"
              required
            />
          </div>

          <div className={styles.formField}>
            <Input
              label="Expiry Date"
              value={formData.expiryDate || ""}
              onChange={(e) => onChange("expiryDate", e.target.value)}
              error={errors.expiryDate}
              placeholder="MM/YY"
              maxLength={5}
              required
            />
          </div>

          <div className={styles.formField}>
            <Input
              label="CVV"
              type="password"
              value={formData.cvv || ""}
              onChange={(e) => onChange("cvv", e.target.value)}
              error={errors.cvv}
              placeholder="123"
              maxLength={4}
              required
            />
          </div>
        </div>
      )}

      {formData.paymentMethod === "upi" && (
        <div className={styles.formGrid}>
          <div className={`${styles.formField} ${styles.fullWidth}`}>
            <Input
              label="UPI ID"
              value={formData.upiId || ""}
              onChange={(e) => onChange("upiId", e.target.value)}
              error={errors.upiId}
              placeholder="yourname@upi"
              required
            />
          </div>
        </div>
      )}

      {formData.paymentMethod === "wallet" && (
        <div className={styles.walletInfo}>
          <p>You will be redirected to complete payment via your wallet.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
