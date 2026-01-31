"use client";

import { useState, useEffect, useCallback } from "react";
import { Inventory } from "@/types";
import { inventoryService } from "@/services/inventoryService";

export function useInventory() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLowStock = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getLowStockProducts();
      setInventory(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const restock = async (productId: string, quantity: number) => {
    try {
      await inventoryService.restockProduct(productId, quantity);
      // Optional: re-fetch or update local state
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateThreshold = async (productId: string, threshold: number) => {
    try {
      await inventoryService.updateLowStockThreshold(productId, threshold);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    inventory,
    loading,
    error,
    fetchLowStock,
    restock,
    updateThreshold,
  };
}
