"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "@/styles/SeasonalPickSection.module.css";

interface Season {
  id: string;
  name: string;
  image: string;
  description: string;
  query: string;
}

const seasons: Season[] = [
  {
    id: "spring",
    name: "Spring",
    image: "/Product/SeasonalImg/spring.webp",
    description: "Fresh blooms and new beginnings",
    query: "SPRING",
  },
  {
    id: "summer",
    name: "Summer",
    image: "/Product/SeasonalImg/summer.jpg",
    description: "Sunshine and warm vibes",
    query: "SUMMER",
  },
  {
    id: "autumn",
    name: "Autumn",
    image: "/Product/SeasonalImg/autumn.jpg",
    description: "Cozy colors and crisp air",
    query: "FALL",
  },
  {
    id: "winter",
    name: "Winter",
    image: "/Product/SeasonalImg/winter.jpg",
    description: "Snow and warmth indoors",
    query: "WINTER",
  },
  {
    id: "monsoon",
    name: "Monsoon",
    image: "/Product/SeasonalImg/monsoone.jpg",
    description: "Rainy days and cozy moments",
    query: "MONSOON",
  },
  {
    id: "rainy",
    name: "All Season",
    image: "/Product/SeasonalImg/rainy.webp",
    description: "Products for every weather",
    query: "ALL_SEASON",
  },
];

export default function SeasonalPickSection() {
  const router = useRouter();
  const [hoveredSeason, setHoveredSeason] = useState<string | null>(null);

  const handleSeasonClick = (seasonQuery: string) => {
    router.push(`/search?season=${seasonQuery}`);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Absolute Positioned Title Card */}
        <div className={styles.titleCard}>
          <h2 className={styles.title}>Season Pick</h2>
          <p className={styles.subtitle}>
            Discover products perfect for every season. Browse through our
            curated collections tailored to match the mood and vibe of each time
            of year.
          </p>
        </div>

        {/* Scrollable Season Cards */}
        <div className={styles.scrollContainer}>
          <div className={styles.cardsWrapper}>
            {seasons.map((season) => (
              <div
                key={season.id}
                className={styles.seasonCard}
                onClick={() => handleSeasonClick(season.query)}
                onMouseEnter={() => setHoveredSeason(season.id)}
                onMouseLeave={() => setHoveredSeason(null)}>
                <div className={styles.seasonImageWrapper}>
                  <Image
                    src={season.image}
                    alt={season.name}
                    fill
                    className={styles.seasonImage}
                    sizes="(max-width: 768px) 45vw, 300px"
                    style={{ objectFit: "cover" }}
                  />
                  <div
                    className={`${styles.overlay} ${
                      hoveredSeason === season.id ? styles.overlayHovered : ""
                    }`}>
                    <h3 className={styles.seasonName}>{season.name}</h3>
                    <p className={styles.seasonDescription}>
                      {season.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
