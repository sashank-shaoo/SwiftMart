"use client";

import React from "react";
import { Product } from "@/types";
import styles from "@/styles/Home.module.css";
import { ShoppingCart, Heart } from "lucide-react";
import Button from "@/components/common/Button";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const imageUrl =
    !product.images[0] || product.images[0] === "image.jpg"
      ? "/placeholder.png"
      : product.images[0];

  return (
    <div className={styles.productCard}>
      <div className={styles.imageWrapper}>
        <img
          src={imageUrl}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <button
          className={styles.wishlistBtn}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "white",
            padding: "8px",
            borderRadius: "50%",
            color: "#629FAD",
          }}>
          <Heart size={18} />
        </button>
      </div>

      <h3 className={styles.productName}>{product.name}</h3>
      <div className={styles.cardFooter}>
        <span className={styles.productPrice}>${product.price}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => addToCart(product.id!, 1)}
          style={{ padding: "8px" }}>
          <ShoppingCart size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
