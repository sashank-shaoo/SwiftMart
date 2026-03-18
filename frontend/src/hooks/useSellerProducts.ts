"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { productService } from "@/services/productService";

export function useSellerProducts() {
  const router = useRouter();
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Access guard
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "seller" || user.verification_status !== "verified") {
      router.push("/");
      return;
    }
    fetchProducts();
  }, [user, router]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getSellerProducts(user?.id!);
      setProducts(data);
    } catch (err: any) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (formData: FormData) => {
    if (user?.id) formData.append("seller_id", user.id);
    await productService.createProduct(formData);
    setIsFormOpen(false);
    fetchProducts();
  };

  const handleUpdateProduct = async (formData: FormData) => {
    if (!selectedProduct) return;
    await productService.updateProduct(selectedProduct.id!, formData);
    setIsFormOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    try {
      await productService.deleteProduct(selectedProduct.id!);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    }
  };

  const handleCreateNew = () => {
    setSelectedProduct(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedProduct(null);
  };

  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  return {
    products,
    loading,
    isFormOpen,
    isDeleteModalOpen,
    selectedProduct,
    formMode,
    handleCreateProduct,
    handleUpdateProduct,
    handleEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleCreateNew,
    closeForm,
    closeDeleteModal,
  };
}
