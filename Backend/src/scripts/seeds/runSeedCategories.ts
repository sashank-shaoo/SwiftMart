import dotenv from "dotenv";
dotenv.config();
import { query } from "../../db/db";

/**
 * Seed default categories into the database
 */
async function seedCategories() {
  console.log("🌱 Starting category seeding...\n");

  const categories = [
    { name: "Electronics", slug: "electronics" },
    { name: "Fashion & Apparel", slug: "fashion" },
    { name: "Home & Garden", slug: "home-garden" },
    { name: "Sports & Outdoors", slug: "sports-outdoors" },
    { name: "Books & Media", slug: "books-media" },
    { name: "Toys & Games", slug: "toys-games" },
    { name: "Health & Beauty", slug: "health-beauty" },
    { name: "Food & Beverages", slug: "food-beverages" },
    { name: "Automotive", slug: "automotive" },
    { name: "Office Supplies", slug: "office-supplies" },
  ];

  try {
    console.log(`📦 Inserting ${categories.length} categories...\n`);

    for (const category of categories) {
      const result = await query(
        `INSERT INTO categories (name, slug)
         VALUES ($1, $2)
         ON CONFLICT (slug) DO NOTHING
         RETURNING id, name, slug`,
        [category.name, category.slug],
      );

      if (result.rows.length > 0) {
        console.log(`✅ Created: ${category.name} (${category.slug})`);
      } else {
        console.log(`⏭️  Skipped: ${category.name} (already exists)`);
      }
    }

    console.log("\n🎉 Category seeding completed!\n");

    // Display all categories
    console.log("📋 Current categories in database:");
    const allCategories = await query(
      "SELECT id, name, slug, created_at FROM categories ORDER BY name",
    );

    console.table(
      allCategories.rows.map((cat) => ({
        Name: cat.name,
        Slug: cat.slug,
        ID: cat.id,
      })),
    );

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding categories:", error);
    process.exit(1);
  }
}

// Run the seed function
seedCategories();
