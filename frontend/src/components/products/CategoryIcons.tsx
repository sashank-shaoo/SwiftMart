"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/CategoryIcons.module.css";

interface Category {
  id: string;
  name: string;
  icon: string;
}

const categories: Category[] = [
  {
    id: "automotive",
    name: "Automotive",
    icon: "/Product/Icons/Automotive.png",
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: "/Product/Icons/Electronics.png",
  },
  {
    id: "fashion",
    name: "Fashion & Apparel",
    icon: "/Product/Icons/Fashion & Apparel.png",
  },
  {
    id: "food",
    name: "Food & Beverages",
    icon: "/Product/Icons/Food & Beverages.png",
  },
  {
    id: "health",
    name: "Health & Beauty",
    icon: "/Product/Icons/Health & Beauty.png",
  },
  {
    id: "home",
    name: "Home & Garden",
    icon: "/Product/Icons/Home & Garden.png",
  },
  {
    id: "office",
    name: "Office Supplies",
    icon: "/Product/Icons/Office Supplies.png",
  },
  { id: "toys", name: "Toys & Games", icon: "/Product/Icons/Toys & Games.png" },
  {
    id: "books",
    name: "Books & Media",
    icon: "/Product/Icons/books and media.png",
  },
  { id: "sport", name: "Sports", icon: "/Product/Icons/sport.png" },
];

export default function CategoryIcons() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <section className={styles.categorySection}>
      <div className={styles.scrollContainer} ref={scrollContainerRef}>
        <div className={styles.iconsWrapper}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/search?category=${category.id}`}
              className={`${styles.categoryCard} ${
                activeCategory === category.id ? styles.active : ""
              }`}
              onClick={() => setActiveCategory(category.id)}>
              <div className={styles.iconCircle}>
                <Image
                  src={category.icon}
                  alt={category.name}
                  width={60}
                  height={60}
                  className={styles.icon}
                />
              </div>
              <p className={styles.categoryName}>{category.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
