"use client";

import React from "react";
import styles from "@/styles/ProductSalesTable.module.css";
import { TrendingUp, TrendingDown, Package } from "lucide-react";

interface ProductWithMetrics {
  id: string;
  name: string;
  category_name?: string;
  total_units_sold: number;
  total_revenue: number;
  total_orders: number;
  price?: number;
}

interface ProductSalesTableProps {
  products: ProductWithMetrics[];
  sortBy: "revenue" | "units";
  onSortChange: (sortBy: "revenue" | "units") => void;
  limit?: number;
}

export default function ProductSalesTable({
  products,
  sortBy,
  onSortChange,
  limit,
}: ProductSalesTableProps) {
  const displayProducts = limit ? products.slice(0, limit) : products;

  if (products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Package size={48} color="var(--color-muted)" />
        <p>No sales data available yet</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Sort Toggle */}
      <div className={styles.sortToggle}>
        <button
          className={sortBy === "revenue" ? styles.active : ""}
          onClick={() => onSortChange("revenue")}>
          <TrendingUp size={16} />
          By Revenue
        </button>
        <button
          className={sortBy === "units" ? styles.active : ""}
          onClick={() => onSortChange("units")}>
          <TrendingDown size={16} />
          By Units
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th className={styles.numberCell}>Units Sold</th>
              <th className={styles.numberCell}>Revenue</th>
              <th className={styles.numberCell}>Orders</th>
            </tr>
          </thead>
          <tbody>
            {displayProducts.map((product, index) => (
              <tr key={product.id}>
                <td>
                  <div className={styles.productCell}>
                    <span className={styles.rank}>#{index + 1}</span>
                    <span className={styles.productName}>{product.name}</span>
                  </div>
                </td>
                <td>
                  <span className={styles.category}>
                    {product.category_name || "N/A"}
                  </span>
                </td>
                <td className={styles.numberCell}>
                  <strong>
                    {Number(product.total_units_sold).toLocaleString()}
                  </strong>
                </td>
                <td className={styles.numberCell}>
                  <span className={styles.revenue}>
                    ${Number(product.total_revenue).toFixed(2)}
                  </span>
                </td>
                <td className={styles.numberCell}>
                  {Number(product.total_orders).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
