"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import { searchService } from "@/services/searchService";

export function useSearch(query: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await searchService.searchProducts(query);
        setProducts(res.products);
        setTotal(res.total);
      } catch (err) {
        console.error("Search failed:", err);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return { products, total, loading, error };
}
