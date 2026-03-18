import Link from "next/link";
import { Product } from "@/types";
import styles from "@/styles/ProductCard.module.css"; // Updated import
import { ShoppingCart } from "lucide-react";
import Button from "@/components/common/Button";
import { useCart } from "@/context/CartContext";
import StarRating from "@/components/common/StarRating";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const imageUrl =
    !product.images[0] || product.images[0] === "image.jpg"
      ? "/placeholder.png"
      : product.images[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    addToCart(product.id!, 1);
  };

  return (
    <Link href={`/products/${product.id}`} className={styles.link}>
      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <img src={imageUrl} alt={product.name} />
        </div>

        <div className={styles.content}>
          <h3 className={styles.name}>{product.name}</h3>

          {/* Rating Display */}
          <div className={styles.ratingSection}>
            <StarRating rating={product.rating || 0} size={16} />
            {product.review_count !== undefined && product.review_count > 0 && (
              <span className={styles.reviewCount}>
                ({product.review_count})
              </span>
            )}
          </div>

          <div className={styles.footer}>
            <span className={styles.price}>${product.price}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddToCart}
              style={{ padding: "8px" }}>
              <ShoppingCart size={18} />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
