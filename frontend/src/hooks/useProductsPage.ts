"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import { productService } from "@/services/productService";

export function useProductsPage() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [premium, setPremium] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [newRes, bestRes, allData] = await Promise.all([
          productService.getNewArrivals(),
          productService.getBestSellers(),
          productService.getAllProducts(),
        ]);

        setNewArrivals(newRes);
        setBestSellers(bestRes);

        // Sort by price descending → premium
        const sortedByPrice = [...allData.products].sort(
          (a, b) => b.price - a.price,
        );
        setPremium(sortedByPrice);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { newArrivals, bestSellers, premium, loading };
}
