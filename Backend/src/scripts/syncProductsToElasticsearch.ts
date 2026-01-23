import "dotenv/config";
import ElasticsearchService from "../services/ElasticsearchService";
import { ProductDao } from "../daos/ProductDao";

/**
 * Sync all existing products from PostgreSQL to Elasticsearch
 * Run this script once after setting up Elasticsearch
 *
 * Usage: npx ts-node src/scripts/syncProductsToElasticsearch.ts
 */
async function syncProducts() {
  console.log("🔄 Starting Elasticsearch sync...\n");

  // Check connection
  const isConnected = await ElasticsearchService.checkConnection();
  if (!isConnected) {
    console.error("❌ Failed to connect to Elasticsearch. Exiting.");
    process.exit(1);
  }

  // Create index if not exists
  console.log("\n📦 Creating index...");
  await ElasticsearchService.createIndex();

  // Fetch all products from PostgreSQL
  console.log("\n📥 Fetching products from database...");
  const products = await ProductDao.findAllProducts();
  console.log(`   Found ${products.length} products`);

  if (products.length === 0) {
    console.log("\n✅ No products to sync");
    process.exit(0);
  }

  // Enrich products with additional data
  console.log("\n🔧 Enriching product data...");
  const enrichedProducts = [];

  for (const product of products) {
    const details = await ProductDao.findProductWithDetails(product.id!);
    if (details) {
      enrichedProducts.push({
        id: details.id,
        name: details.name,
        description: details.description,
        price: details.price,
        category: details.category_name,
        category_id: details.category_id,
        seller_id: details.seller_id,
        seller_name: details.seller_name,
        store_name: details.store_name,
        in_stock: details.in_stock,
        stock_quantity: details.stock_quantity || 0,
        images: details.images,
        created_at: details.created_at,
        updated_at: details.updated_at,
      });
    }
  }

  // Bulk index products
  console.log("\n📤 Indexing products to Elasticsearch...");
  await ElasticsearchService.bulkIndexProducts(enrichedProducts);

  console.log(
    `\n✅ Successfully synced ${enrichedProducts.length} products to Elasticsearch!`,
  );
  console.log("\n💡 Your products are now searchable.");

  process.exit(0);
}

syncProducts().catch((error) => {
  console.error("❌ Sync failed:", error);
  process.exit(1);
});
