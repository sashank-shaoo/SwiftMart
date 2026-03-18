"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "@/styles/ProductDetail.module.css";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Modal from "@/components/common/Modal";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const validImages =
    images.length > 0 && images[0] !== "image.jpg"
      ? images
      : ["/placeholder.png"];

  const handlePrevious = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? validImages.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === validImages.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className={styles.gallery}>
      {/* Main Image */}
      <div className={styles.mainImageContainer}>
        <AnimatePresence mode="wait">
          <motion.img
            key={selectedIndex}
            src={validImages[selectedIndex]}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            className={styles.mainImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {validImages.length > 1 && (
          <>
            <button
              className={`${styles.navBtn} ${styles.navBtnPrev}`}
              onClick={handlePrevious}
              aria-label="Previous image">
              <ChevronLeft size={24} />
            </button>
            <button
              className={`${styles.navBtn} ${styles.navBtnNext}`}
              onClick={handleNext}
              aria-label="Next image">
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <button
          className={styles.zoomBtn}
          onClick={() => setIsZoomed(true)}
          aria-label="Zoom image">
          <ZoomIn size={18} />
        </button>

        {validImages.length > 1 && (
          <div className={styles.imageCounter}>
            {selectedIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className={styles.thumbnails}>
          {validImages.map((img, idx) => (
            <button
              key={idx}
              className={`${styles.thumbnail} ${idx === selectedIndex ? styles.thumbnailActive : ""}`}
              onClick={() => setSelectedIndex(idx)}
              aria-label={`View image ${idx + 1}`}>
              <img src={img} alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <Modal isOpen={isZoomed} onClose={() => setIsZoomed(false)} size="lg">
        <div className={styles.zoomedImageContainer}>
          <img
            src={validImages[selectedIndex]}
            alt={`${productName} - Zoomed`}
            className={styles.zoomedImage}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ProductGallery;
