"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WishlistWithProduct } from "@/types";
import { wishlistService } from "@/services/wishlistService";
import { useAuth } from "@/context/AuthContext";

export function useWishlist() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [wishlist, setWishlist] = useState<WishlistWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch wishlist when user is available
  useEffect(() => {
    if (user) fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await wishlistService.getUserWishlist();
      setWishlist(data.wishlist);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (product_id: string) => {
    setRemovingIds((prev) => new Set(prev).add(product_id));
    try {
      await wishlistService.removeFromWishlist(product_id);
      setWishlist((prev) =>
        prev.filter((item) => item.product_id !== product_id),
      );
      return true;
    } catch {
      return false;
    } finally {
      setRemovingIds((prev) => {
        const s = new Set(prev);
        s.delete(product_id);
        return s;
      });
    }
  };

  const viewProduct = (product_id: string) =>
    router.push(`/products/${product_id}`);

  const goToProducts = () => router.push("/products");

  return {
    wishlist,
    loading: authLoading || loading,
    removingIds,
    remove,
    viewProduct,
    goToProducts,
  };
}
