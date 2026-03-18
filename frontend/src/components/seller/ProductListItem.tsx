"use client";

import React from "react";
import styles from "@/styles/Seller.module.css";
import { Product } from "@/types";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import Button from "@/components/common/Button";

interface ProductListItemProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const imageUrl =
    product.images[0] && product.images[0] !== "image.jpg"
      ? product.images[0]
      : "/placeholder.png";

  return (
    <div className={styles.productListItem}>
      <div className={styles.productImage}>
        <img src={imageUrl} alt={product.name} />
      </div>

      <div className={styles.productDetails}>
        <div className={styles.productInfo}>
          <h3 className={styles.productTitle}>{product.name}</h3>
          <p className={styles.productDescription}>
            {product.description?.substring(0, 100)}...
          </p>
          <div className={styles.productMeta}>
            <span className={styles.productPrice}>
              ₹{Number(product.price).toFixed(2)}
            </span>
            {product.original_price && (
              <span className={styles.productOriginalPrice}>
                ₹{Number(product.original_price).toFixed(2)}
              </span>
            )}
            <span className={styles.productStock}>
              Stock: {product.stock_quantity || 0}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.productMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Status</span>
          <span
            className={`${styles.statusBadge} ${product.is_active ? styles.statusActive : styles.statusInactive}`}>
            {product.is_active ? (
              <>
                <Eye size={14} /> Active
              </>
            ) : (
              <>
                <EyeOff size={14} /> Inactive
              </>
            )}
          </span>
        </div>
      </div>

      <div className={styles.productActions}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          icon={<Edit size={16} />}>
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(product)}
          style={{ color: "#ef4444", borderColor: "#ef4444" }}
          icon={<Trash2 size={16} />}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default ProductListItem;
