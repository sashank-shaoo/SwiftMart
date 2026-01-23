import { Client } from "@elastic/elasticsearch";
import logger from "../config/logger";

interface SearchParams {
  query?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  page?: number;
  limit?: number;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest";
}

interface ProductDocument {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  category_id?: string;
  seller_id: string;
  seller_name?: string;
  store_name?: string;
  in_stock: boolean;
  stock_quantity: number;
  images?: string[];
  created_at: Date;
  updated_at?: Date;
}

class ElasticsearchService {
  private client: Client;
  private index: string;

  constructor() {
    this.index = process.env.ELASTICSEARCH_INDEX || "products";

    // Initialize client with URL + API Key
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL,
      auth: {
        apiKey: process.env.ELASTICSEARCH_API_KEY || "",
      },
    });
  }

  async checkConnection(): Promise<boolean> {
    try {
      const info = await this.client.info();
      logger.info(`✅ Connected to Elasticsearch: ${info.cluster_name}`);
      return true;
    } catch (error: any) {
      logger.error(`❌ Elasticsearch connection failed: ${error.message}`);
      return false;
    }
  }

  async createIndex(): Promise<void> {
    try {
      const exists = await this.client.indices.exists({ index: this.index });

      if (exists) {
        logger.info(`Index '${this.index}' already exists`);
        return;
      }

      // Serverless mode: no shards/replicas settings allowed
      await this.client.indices.create({
        index: this.index,
        mappings: {
          properties: {
            id: { type: "keyword" },
            name: {
              type: "text",
              fields: {
                keyword: { type: "keyword" },
              },
            },
            description: { type: "text" },
            price: { type: "float" },
            category: {
              type: "text",
              fields: {
                keyword: { type: "keyword" },
              },
            },
            category_id: { type: "keyword" },
            seller_id: { type: "keyword" },
            seller_name: { type: "text" },
            store_name: { type: "text" },
            in_stock: { type: "boolean" },
            stock_quantity: { type: "integer" },
            images: { type: "keyword" },
            created_at: { type: "date" },
            updated_at: { type: "date" },
          },
        },
      });

      logger.info(`✅ Created Elasticsearch index: ${this.index}`);
    } catch (error: any) {
      logger.error(`Failed to create index: ${error.message}`);
      throw error;
    }
  }

  async indexProduct(product: ProductDocument): Promise<void> {
    try {
      // V8 API: use document instead of body, and separate id
      await this.client.index({
        index: this.index,
        id: product.id,
        document: {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          category_id: product.category_id,
          seller_id: product.seller_id,
          seller_name: product.seller_name,
          store_name: product.store_name,
          in_stock: product.stock_quantity > 0,
          stock_quantity: product.stock_quantity,
          images: product.images,
          created_at: product.created_at,
          updated_at: product.updated_at,
        },
        refresh: true,
      });

      logger.info(`Indexed product: ${product.id}`);
    } catch (error: any) {
      logger.error(`Failed to index product ${product.id}: ${error.message}`);
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await this.client.delete({
        index: this.index,
        id: productId,
        refresh: true,
      });

      logger.info(`Deleted product from index: ${productId}`);
    } catch (error: any) {
      if (error.meta?.statusCode !== 404) {
        logger.error(`Failed to delete product ${productId}: ${error.message}`);
      }
    }
  }

  async searchProducts(params: SearchParams): Promise<{
    products: any[];
    total: number;
  }> {
    const {
      query,
      category,
      min_price,
      max_price,
      in_stock,
      page = 1,
      limit = 20,
      sort = "relevance",
    } = params;

    const must: any[] = [];
    const filter: any[] = [];

    // Full-text search with fuzzy matching
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ["name^3", "description", "category"],
          fuzziness: "AUTO",
          prefix_length: 1,
        },
      });
    }

    // Category filter
    if (category) {
      filter.push({
        term: { "category.keyword": category },
      });
    }

    // Price range filter
    if (min_price !== undefined || max_price !== undefined) {
      const range: any = {};
      if (min_price !== undefined) range.gte = min_price;
      if (max_price !== undefined) range.lte = max_price;
      filter.push({ range: { price: range } });
    }

    // In-stock filter
    if (in_stock !== undefined) {
      filter.push({ term: { in_stock } });
    }

    // Build sort
    let sortQuery: any[] = [];
    switch (sort) {
      case "price_asc":
        sortQuery = [{ price: "asc" as const }];
        break;
      case "price_desc":
        sortQuery = [{ price: "desc" as const }];
        break;
      case "newest":
        sortQuery = [{ created_at: "desc" as const }];
        break;
      default:
        sortQuery = query
          ? [{ _score: "desc" as const }]
          : [{ created_at: "desc" as const }];
    }

    try {
      // V8 API: use query, sort, from, size directly (not in body)
      const result = await this.client.search({
        index: this.index,
        query: {
          bool: {
            must: must.length > 0 ? must : [{ match_all: {} }],
            filter,
          },
        },
        sort: sortQuery,
        from: (page - 1) * limit,
        size: limit,
        highlight: query
          ? {
              fields: {
                name: {},
                description: {},
              },
              pre_tags: ["<em>"],
              post_tags: ["</em>"],
            }
          : undefined,
      });

      const hits = result.hits.hits;
      const total =
        typeof result.hits.total === "number"
          ? result.hits.total
          : result.hits.total?.value || 0;

      const products = hits.map((hit: any) => ({
        ...hit._source,
        id: hit._id,
        score: hit._score,
        highlight: hit.highlight,
      }));

      return { products, total };
    } catch (error: any) {
      logger.error(`Search failed: ${error.message}`);
      return { products: [], total: 0 };
    }
  }

  async bulkIndexProducts(products: ProductDocument[]): Promise<void> {
    if (products.length === 0) return;

    const operations = products.flatMap((product) => [
      { index: { _index: this.index, _id: product.id } },
      {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        category_id: product.category_id,
        seller_id: product.seller_id,
        seller_name: product.seller_name,
        store_name: product.store_name,
        in_stock: product.stock_quantity > 0,
        stock_quantity: product.stock_quantity,
        images: product.images,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
    ]);

    try {
      const result = await this.client.bulk({
        refresh: true,
        operations,
      });

      if (result.errors) {
        logger.error("Bulk indexing had errors");
      } else {
        logger.info(`✅ Bulk indexed ${products.length} products`);
      }
    } catch (error: any) {
      logger.error(`Bulk indexing failed: ${error.message}`);
    }
  }
}

export default new ElasticsearchService();
