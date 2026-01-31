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
    return apiFetch(`/products?${query}`);
  },

  getProductById: async (id: string): Promise<Product> => {
    return apiFetch(`/products/${id}`);
  },

  searchProducts: async (q: string): Promise<Product[]> => {
    return apiFetch(`/products/search?q=${q}`);
  },

  getBestSellers: async (): Promise<Product[]> => {
    return apiFetch("/products/bestsellers");
  },

  getTopRated: async (): Promise<Product[]> => {
    return apiFetch("/products/top-rated");
  },

  getNewArrivals: async (): Promise<Product[]> => {
    return apiFetch("/products/new-arrivals");
  },

  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    return apiFetch(`/products/category/${categoryId}`);
  },

  getProductsBySeason: async (season: string): Promise<Product[]> => {
    return apiFetch(`/products/season/${season}`);
  },

  getSellerProducts: async (sellerId: string): Promise<Product[]> => {
    return apiFetch(`/products/seller/${sellerId}`);
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
