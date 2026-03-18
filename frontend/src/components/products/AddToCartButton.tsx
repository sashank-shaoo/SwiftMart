"use client";

import React, { useState } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import Button from "@/components/common/Button";
import styles from "@/styles/ProductDetail.module.css";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/context/NotificationContext";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  stock: number;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  productName,
  stock,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const { notifySuccess } = useNotification();

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(productId, quantity);
      notifySuccess(`${productName} added to cart!`);
    } catch (error) {
      // Error handled by global handler
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      await addToCart(productId, quantity);
      // Redirect to checkout page
      window.location.href = "/checkout";
    } catch (error) {
      // Error handled by global handler
      setLoading(false);
    }
  };

  const isOutOfStock = stock <= 0;

  return (
    <div className={styles.cartSection}>
      {/* Quantity Selector */}
      <div className={styles.quantitySelector}>
        <span className={styles.quantityLabel}>Quantity:</span>
        <div className={styles.quantityControls}>
          <button
            className={styles.quantityBtn}
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || isOutOfStock}
            aria-label="Decrease quantity">
            <Minus size={16} />
          </button>
          <span className={styles.quantityValue}>{quantity}</span>
          <button
            className={styles.quantityBtn}
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= stock || isOutOfStock}
            aria-label="Increase quantity">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        {/* Add to Cart Button */}
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          isLoading={loading}
          icon={<ShoppingCart size={20} />}>
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>

        {/* Buy Now Button */}
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          isLoading={loading}>
          {isOutOfStock ? "Out of Stock" : "Buy Now"}
        </Button>
      </div>
    </div>
  );
};

export default AddToCartButton;
