import { apiFetch } from "@/lib/apiClient";
import { Product } from "@/types";

interface SearchResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export const searchService = {
  /**
   * Search products by text query
   */
  searchProducts: async (
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<SearchResponse> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    return apiFetch(`/products/search?${params.toString()}`);
  },
};
