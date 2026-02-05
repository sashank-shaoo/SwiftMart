"use client";

import { useState, useEffect } from "react";
import { CartItem } from "@/types";
import { cartService } from "@/services/cartService";
import { useAuth } from "@/context/AuthContext";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setItems([]); // Clear cart if logged out
    }
  }, [user]);

  const addToCart = async (productId: string, quantity: number) => {
    try {
      const newItem = await cartService.addToCart(productId, quantity);
      setItems((prev) => [...prev, newItem]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await cartService.updateQuantity(itemId, quantity);
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await cartService.removeFromCart(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setItems([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.price_at_time * item.quantity,
    0,
  );

  return {
    items,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    refreshCart: fetchCart,
  };
}
