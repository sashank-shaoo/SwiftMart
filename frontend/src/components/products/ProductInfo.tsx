"use client";

import React from "react";
import styles from "@/styles/ProductDetail.module.css";
import StarRating from "@/components/common/StarRating";
import { Package, Shield, Truck } from "lucide-react";

interface ProductInfoProps {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  category?: string;
  attributes?: Record<string, any>;
  stock?: number;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  description,
  price,
  originalPrice,
  rating = 0,
  reviewCount = 0,
  category,
  attributes,
  stock = 0,
}) => {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className={styles.productInfo}>
      {/* Category Badge */}
      {category && <span className={styles.categoryBadge}>{category}</span>}

      {/* Product Name */}
      <h1 className={styles.productTitle}>{name}</h1>

      {/* Rating */}
      <div className={styles.ratingContainer}>
        <StarRating rating={rating} size={20} />
        <span className={styles.reviewCount}>({reviewCount} reviews)</span>
      </div>

      {/* Price */}
      <div className={styles.priceSection}>
        <div className={styles.priceContainer}>
          <span className={styles.currentPrice}>
            ${Number(price).toFixed(2)}
          </span>
          {originalPrice && Number(originalPrice) > Number(price) && (
            <>
              <span className={styles.originalPrice}>
                ${Number(originalPrice).toFixed(2)}
              </span>
              <span className={styles.discount}>
                {Math.round(
                  ((Number(originalPrice) - Number(price)) /
                    Number(originalPrice)) *
                    100,
                )}
                % OFF
              </span>
            </>
          )}
        </div>
        {stock > 0 && stock < 10 && (
          <span className={styles.lowStock}>Only {stock} left in stock!</span>
        )}
      </div>

      {/* Description */}
      {description && (
        <div className={styles.description}>
          <h3>About this product</h3>
          <p>{description}</p>
        </div>
      )}

      {/* Product Attributes */}
      {attributes && Object.keys(attributes).length > 0 && (
        <div className={styles.attributes}>
          <h3>Product Details</h3>
          <div className={styles.attributeGrid}>
            {Object.entries(attributes).map(([key, value]) => (
              <div key={key} className={styles.attributeItem}>
                <span className={styles.attributeKey}>
                  {key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/_/g, " ")}
                  :
                </span>
                <span className={styles.attributeValue}>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className={styles.additionalInfo}>
        <div className={styles.infoItem}>
          <Shield size={18} />
          <span>Secure Payment</span>
        </div>
        <div className={styles.infoItem}>
          <Truck size={18} />
          <span>Fast Delivery</span>
        </div>
        <div className={styles.infoItem}>
          <Package size={18} />
          <span>Easy Returns</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
