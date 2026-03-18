"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/ProductDetail.module.css";
import { Product, Review } from "@/types";
import { productService } from "@/services/productService";
import { getProductReviews } from "@/services/reviewService";
import { useAuth } from "@/context/AuthContext";
import ProductImageSwipe from "@/components/products/ProductImageSwipe";
import ProductInfo from "@/components/products/ProductInfo";
import AddToCartButton from "@/components/products/AddToCartButton";
import ProductCard from "@/components/products/ProductCard";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const data = await getProductReviews(productId);
      setReviews(data.reviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const productData = await productService.getProductById(productId);
        setProduct(productData);

        // Fetch related products from same category
        if (productData.category_id) {
          const categoryProducts = await productService.getProductsByCategory(
            productData.category_id,
          );
          const filtered = categoryProducts
            .filter((p) => p.id !== productId)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }

        // Fetch reviews
        await fetchReviews();
      } catch (error) {
        console.error("Failed to fetch product:", error);
        router.push("/products");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId, router]);

  if (loading) {
    return <LoadingSpinner fullPage size="lg" />;
  }

  if (!product) {
    return (
      <div className={styles.errorContainer}>
        <h2>Product not found</h2>
        <Link href="/products">Return to Products</Link>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        <Link href="/products">Products</Link>
        <ChevronRight size={16} />
        <span>{product.name}</span>
      </nav>

      {/* Product Details - Info Left, Image Right for Desktop */}
      <div className={styles.productContainer}>
        {/* INFO SECTION (Left on Desktop, Bottom on Mobile) */}
        <motion.div
          className={styles.infoSection}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}>
          <ProductInfo
            name={product.name}
            description={product.description}
            price={product.price}
            originalPrice={product.original_price}
            rating={product.rating}
            reviewCount={product.review_count}
            category={product.category?.name}
            attributes={product.attributes}
            stock={product.stock_quantity}
          />
          <AddToCartButton
            productId={product.id!}
            productName={product.name}
            stock={product.stock_quantity || 0}
          />
        </motion.div>

        {/* IMAGE/SWIPE SECTION (Right on Desktop, Top on Mobile) */}
        <motion.div
          className={styles.gallerySection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}>
          <ProductImageSwipe
            images={product.images || []}
            productName={product.name}
            sku={product.sku}
            price={product.price}
          />
        </motion.div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection
        productId={productId}
        reviews={reviews}
        rating={product.rating || 0}
        reviewCount={product.review_count || 0}
        currentUserId={user?.id}
        onRefresh={fetchReviews}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>You May Also Like</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
