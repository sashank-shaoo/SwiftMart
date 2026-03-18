"use client";

import React from "react";
import { Star } from "lucide-react";
import styles from "@/styles/StarRating.module.css";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 18,
  showValue = false,
  interactive = false,
  onChange,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={styles.container}>
      <div className={styles.stars}>
        {/* Define the gradient */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" /> {/* Amber-400 */}
              <stop offset="50%" stopColor="#f59e0b" /> {/* Amber-500 */}
              <stop offset="100%" stopColor="#f97316" /> {/* Orange-500 */}
            </linearGradient>
          </defs>
        </svg>

        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= displayRating;
          const isPartial =
            !Number.isInteger(displayRating) &&
            starValue === Math.ceil(displayRating);

          return (
            <span
              key={i}
              className={`${styles.star} ${interactive ? styles.interactive : ""}`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: interactive ? "pointer" : "default" }}>
              {isPartial ? (
                <div style={{ position: "relative", display: "inline-block" }}>
                  {/* Background Star (Empty/Stroke) */}
                  <Star
                    size={size}
                    fill="transparent"
                    stroke="#ff9f04ff"
                    strokeWidth={1.5}
                  />
                  {/* Foreground Star (Gradient Fill, Clipped) */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      overflow: "hidden",
                      width: `${(displayRating % 1) * 100}%`,
                    }}>
                    <Star
                      size={size}
                      fill="url(#starGradient)"
                      stroke="url(#starGradient)"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              ) : (
                <Star
                  size={size}
                  fill={isFilled ? "url(#starGradient)" : "transparent"}
                  stroke={isFilled ? "url(#starGradient)" : "#d18426ff"}
                  strokeWidth={1.5}
                />
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className={styles.value}>
          {Number(rating).toFixed(1)} ({maxRating})
        </span>
      )}
    </div>
  );
};

export default StarRating;
