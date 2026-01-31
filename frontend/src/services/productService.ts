import { apiFetch } from "@/lib/apiClient";
import { Product } from "@/types";

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category_id?: string;
  season?: string;
}

export const productService = {
  getAllProducts: async (
    params: GetProductsParams = {},
  ): Promise<{ products: Product[]; total: number }> => {
    const query = new URLSearchParams(params as any).toString();
    const data = await apiFetch(`/products?${query}`);
    return {
      products: data.products,
      total: data.pagination.total,
    };
  },

  getProductById: async (id: string): Promise<Product> => {
    const data = await apiFetch(`/products/${id}`);
    return data.product;
  },

  searchProducts: async (
    q: string,
  ): Promise<{ products: Product[]; total: number }> => {
    const data = await apiFetch(`/products/search?q=${q}`);
    return {
      products: data.products,
      total: data.total,
    };
  },

  getBestSellers: async (): Promise<Product[]> => {
    const data = await apiFetch("/products/bestsellers");
    return data.products;
  },

  getTopRated: async (): Promise<Product[]> => {
    const data = await apiFetch("/products/top-rated");
    return data.products;
  },

  getNewArrivals: async (): Promise<Product[]> => {
    const data = await apiFetch("/products/new-arrivals");
    return data.products;
  },

  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    const data = await apiFetch(`/products/category/${categoryId}`);
    return data.products;
  },

  getProductsBySeason: async (season: string): Promise<Product[]> => {
    const data = await apiFetch(`/products/season/${season}`);
    return data.products;
  },

  getSellerProducts: async (sellerId: string): Promise<Product[]> => {
    const data = await apiFetch(`/products/seller/${sellerId}`);
    return data.products;
  },

  createProduct: async (formData: FormData): Promise<Product> => {
    return apiFetch("/products", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("sfm_token")}`,
      },
    });
  },

  updateProduct: async (id: string, formData: FormData): Promise<Product> => {
    return apiFetch(`/products/${id}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("sfm_token")}`,
      },
    });
  },

  deleteProduct: async (id: string): Promise<void> => {
    return apiFetch(`/products/${id}`, { method: "DELETE" });
  },
};
