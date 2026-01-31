"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { CartItem } from "@/types";
import { cartService } from "@/services/cartService";
import { useAuth } from "./AuthContext";

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity: number) => {
    try {
      const newItem = await cartService.addToCart(productId, quantity);
      // Backend returns the added item; update or re-fetch
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.product_id === productId,
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex].quantity += quantity;
          return updated;
        }
        return [...prev, newItem];
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
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
      throw err;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await cartService.removeFromCart(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setItems([]);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.price_at_time * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
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
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
