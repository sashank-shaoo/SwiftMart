"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import styles from "@/styles/ProductImageSwipe.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageSwipeProps {
  images: string[];
  productName: string;
  sku?: string;
  price: number;
}

const ProductImageSwipe: React.FC<ProductImageSwipeProps> = ({
  images,
  productName,
  sku,
  price,
}) => {
  const [[page, direction], setPage] = useState([0, 0]);
  const currentIndex = Math.abs(page % (images.length || 1));
  const validImages =
    images.length > 0 && images[0] !== "image.jpg"
      ? images
      : ["/placeholder-product.jpg"];

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      paginate(-1); // Swipe Right -> Prev
    } else if (info.offset.x < -swipeThreshold) {
      paginate(1); // Swipe Left -> Next
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <div className={styles.container}>
      {/* Main Swipeable Card */}
      <div className={styles.card}>
        <div className={styles.imageViewport}>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className={styles.imageWrapper}
              transition={{
                x: { type: "tween", ease: "easeInOut", duration: 0.2 }, // Standard smooth slide
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              whileTap={{ cursor: "grabbing" }}>
              <Image
                src={validImages[currentIndex]}
                alt={`${productName} - View ${currentIndex + 1}`}
                fill
                className={styles.productImage}
                priority={currentIndex === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </AnimatePresence>

          {/* Overlays */}
          <div className={styles.overlayTopLeft}>
            <span className={styles.overlayName}>{productName}</span>
          </div>
          <div className={styles.overlayTopRight}>
            <span className={styles.overlayPrice}>
              ${Number(price).toFixed(2)}
            </span>
          </div>
          <div className={styles.overlayBottomLeft}>
            <span className={styles.overlaySku}>SKU: {sku || "N/A"}</span>
          </div>

          {/* Navigation Overlay */}
          <div className={styles.navigation}>
            {validImages.length > 1 && (
              <>
                <button
                  onClick={() => paginate(-1)}
                  className={`${styles.navBtn} ${styles.prevBtn}`}
                  aria-label="Previous image">
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => paginate(1)}
                  className={`${styles.navBtn} ${styles.nextBtn}`}
                  aria-label="Next image">
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Pagination Dots */}
          {validImages.length > 1 && (
            <div className={styles.pagination}>
              {validImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage([idx, idx > currentIndex ? 1 : -1])}
                  className={`${styles.dot} ${
                    idx === currentIndex ? styles.activeDot : ""
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails Row (Optional - displayed below on desktop) */}
      {validImages.length > 1 && (
        <div className={styles.thumbnails}>
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setPage([idx, idx > currentIndex ? 1 : -1])}
              className={`${styles.thumbnail} ${
                idx === currentIndex ? styles.thumbnailActive : ""
              }`}>
              <Image
                src={img}
                alt=""
                width={60}
                height={60}
                className={styles.thumbImage}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageSwipe;
