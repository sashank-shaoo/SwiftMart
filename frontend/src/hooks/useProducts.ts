"use client";

import { useState, useEffect, useCallback } from "react";
import { Product } from "@/types";
import { productService, GetProductsParams } from "@/services/productService";

export function useProducts(initialParams: GetProductsParams = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState(initialParams);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getAllProducts(params);
      setProducts(data.products);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const fetchProduct = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = await productService.getProductById(id);
      setProduct(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = async (formData: FormData) => {
    try {
      const newProduct = await productService.createProduct(formData);
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateProduct = async (id: string, formData: FormData) => {
    try {
      const updated = await productService.updateProduct(id, formData);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      if (product?.id === id) setProduct(updated);
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParams = (newParams: Partial<GetProductsParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  return {
    products,
    product,
    loading,
    error,
    total,
    params,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateParams,
    refreshProducts: fetchProducts,
  };
}
