"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import styles from "@/styles/HeroCarousel.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroCarouselProps {
  images: string[];
  autoPlayInterval?: number;
}

export default function HeroCarousel({
  images,
  autoPlayInterval = 5000,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused && autoPlayInterval > 0) {
      const timer = setInterval(goToNext, autoPlayInterval);
      return () => clearInterval(timer);
    }
  }, [isPaused, autoPlayInterval, goToNext]);

  return (
    <section
      className={styles.heroCarousel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}>
      <div className={styles.carouselContainer}>
        {/* Images */}
        <div className={styles.imageWrapper}>
          {images.map((image, index) => (
            <div
              key={index}
              className={`${styles.slide} ${
                index === currentIndex ? styles.active : ""
              }`}>
              <Image
                src={image}
                alt={`Hero slide ${index + 1}`}
                fill
                priority={index === 0}
                className={styles.image}
                sizes="100vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className={`${styles.navButton} ${styles.prev}`}
          aria-label="Previous slide">
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goToNext}
          className={`${styles.navButton} ${styles.next}`}
          aria-label="Next slide">
          <ChevronRight size={24} />
        </button>

        {/* Dots Navigation */}
        <div className={styles.dots}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`${styles.dot} ${
                index === currentIndex ? styles.activeDot : ""
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
