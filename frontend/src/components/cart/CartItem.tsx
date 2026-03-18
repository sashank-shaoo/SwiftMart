"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "@/styles/Cart.module.css";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/types";
import Link from "next/link";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}) => {
  const product = item.product;
  const imageUrl =
    product?.images[0] && product.images[0] !== "image.jpg"
      ? product.images[0]
      : "/placeholder.png";

  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 99) {
      onUpdateQuantity(item.id!, newQuantity);
    }
  };

  const itemTotal = item.quantity * item.price_at_time;

  return (
    <motion.div
      className={styles.cartItem}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}>
      <div className={styles.itemImage}>
        <Link href={`/products/${product?.id}`}>
          <img src={imageUrl} alt={product?.name} />
        </Link>
      </div>

      <div className={styles.itemDetails}>
        <Link href={`/products/${product?.id}`} className={styles.itemName}>
          {product?.name}
        </Link>
        {product?.sku && <p className={styles.itemSku}>SKU: {product.sku}</p>}
        <p className={styles.itemPrice}>
          ${Number(item.price_at_time).toFixed(2)}
        </p>
      </div>

      <div className={styles.itemControls}>
        <div className={styles.quantityControl}>
          <button
            className={styles.quantityButton}
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating}>
            <Minus size={14} />
          </button>
          <input
            type="number"
            className={styles.quantityInput}
            value={item.quantity}
            onChange={(e) =>
              handleQuantityChange(parseInt(e.target.value) || 1)
            }
            min="1"
            max="99"
            disabled={isUpdating}
          />
          <button
            className={styles.quantityButton}
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={item.quantity >= 99 || isUpdating}>
            <Plus size={14} />
          </button>
        </div>

        <p className={styles.itemTotal}>${Number(itemTotal).toFixed(2)}</p>

        <button
          className={styles.removeBtn}
          onClick={() => onRemove(item.id!)}
          disabled={isUpdating}
          aria-label="Remove item">
          <Trash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default CartItem;
