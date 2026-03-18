"use client";

import React from "react";
import { useNotification } from "@/context/NotificationContext";
import { useSellerProducts } from "@/hooks/useSellerProducts";
import ProductListItem from "@/components/seller/ProductListItem";
import ProductForm from "@/components/seller/ProductForm";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Modal from "@/components/common/Modal";
import styles from "@/styles/Seller.module.css";
import { Plus, Package, AlertCircle } from "lucide-react";

export default function SellerProductsPage() {
  const { notifySuccess, notifyError } = useNotification();
  const {
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
  } = useSellerProducts();

  const onCreate = async (formData: FormData) => {
    try {
      await handleCreateProduct(formData);
      notifySuccess("Product created successfully!");
    } catch {
      notifyError("Failed to create product.");
    }
  };

  const onUpdate = async (formData: FormData) => {
    try {
      await handleUpdateProduct(formData);
      notifySuccess("Product updated successfully!");
    } catch {
      notifyError("Failed to update product.");
    }
  };

  const onDeleteConfirm = async () => {
    try {
      await handleDeleteConfirm();
      notifySuccess("Product deleted successfully!");
    } catch {
      notifyError("Failed to delete product.");
    }
  };

  if (loading) return <LoadingSpinner fullPage size="lg" />;

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Products</h1>
          <p className={styles.subtitle}>Manage your product catalog</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleCreateNew}
          icon={<Plus size={20} />}>
          Add New Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={80} strokeWidth={1.5} />
          <h2>No Products Yet</h2>
          <p>
            Start building your product catalog by adding your first product.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreateNew}
            icon={<Plus size={20} />}>
            Create Your First Product
          </Button>
        </div>
      ) : (
        <div className={styles.productList}>
          {products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <ProductForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={formMode === "create" ? onCreate : onUpdate}
        product={selectedProduct}
        mode={formMode}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Product"
        size="sm">
        <div className={styles.deleteConfirmation}>
          <div className={styles.deleteIcon}>
            <AlertCircle size={48} />
          </div>
          <h3>Are you sure?</h3>
          <p>
            This will permanently delete{" "}
            <strong>{selectedProduct?.name}</strong>. This action cannot be
            undone.
          </p>
          <div className={styles.deleteActions}>
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onDeleteConfirm}
              style={{ background: "#ef4444", borderColor: "#ef4444" }}>
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
