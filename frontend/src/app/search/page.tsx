"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import ProductCard from "@/components/products/ProductCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Search, AlertCircle } from "lucide-react";
import styles from "@/styles/Search.module.css";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const { products, total, loading, error } = useSearch(query);

  if (!query) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyState}>
          <Search size={48} className={styles.emptyIcon} />
          <h2>Search for products</h2>
          <p>Enter a keyword to find what you're looking for.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>
          Search results for "<span className={styles.highlight}>{query}</span>"
        </h1>
        <p>{total} products found</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className={styles.error}>
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyState}>
            <Search size={48} className={styles.emptyIcon} />
            <h2>No results found</h2>
            <p>We couldn't find any products matching "{query}".</p>
            <Link href="/products" className={styles.browseBtn}>
              Browse All Products
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
