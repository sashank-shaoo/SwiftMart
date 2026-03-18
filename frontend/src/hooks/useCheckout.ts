import { useState } from "react";

export interface CheckoutData {
  shipping: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  payment: {
    paymentMethod: "card" | "upi" | "wallet";
    cardNumber?: string;
    cardName?: string;
    expiryDate?: string;
    cvv?: string;
    upiId?: string;
  };
}

export function useCheckout() {
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    shipping: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    payment: {
      paymentMethod: "card",
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateShippingField = (field: string, value: string) => {
    setCheckoutData((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [field]: value,
      },
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updatePaymentField = (field: string, value: string) => {
    setCheckoutData((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        [field]: value,
      },
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateShipping = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { shipping } = checkoutData;

    if (!shipping.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!shipping.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email))
      newErrors.email = "Invalid email format";
    if (!shipping.phone.trim()) newErrors.phone = "Phone number is required";
    if (!shipping.address.trim()) newErrors.address = "Address is required";
    if (!shipping.city.trim()) newErrors.city = "City is required";
    if (!shipping.state.trim()) newErrors.state = "State is required";
    if (!shipping.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!shipping.country.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {};
    const { payment } = checkoutData;

    if (payment.paymentMethod === "card") {
      if (!payment.cardNumber?.trim())
        newErrors.cardNumber = "Card number is required";
      else if (!/^\d{13,19}$/.test(payment.cardNumber.replace(/\s/g, "")))
        newErrors.cardNumber = "Invalid card number";

      if (!payment.cardName?.trim())
        newErrors.cardName = "Cardholder name is required";

      if (!payment.expiryDate?.trim())
        newErrors.expiryDate = "Expiry date is required";
      else if (!/^\d{2}\/\d{2}$/.test(payment.expiryDate))
        newErrors.expiryDate = "Format: MM/YY";

      if (!payment.cvv?.trim()) newErrors.cvv = "CVV is required";
      else if (!/^\d{3,4}$/.test(payment.cvv)) newErrors.cvv = "Invalid CVV";
    } else if (payment.paymentMethod === "upi") {
      if (!payment.upiId?.trim()) newErrors.upiId = "UPI ID is required";
      else if (!/^[\w.-]+@[\w.-]+$/.test(payment.upiId))
        newErrors.upiId = "Invalid UPI ID format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateShipping()) return;
    if (currentStep === 2 && !validatePayment()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return {
    currentStep,
    checkoutData,
    errors,
    updateShippingField,
    updatePaymentField,
    validateShipping,
    validatePayment,
    nextStep,
    prevStep,
  };
}
