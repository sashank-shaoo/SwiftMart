"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/Seller.module.css";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import { Product } from "@/types";
import { Package, Upload, X } from "lucide-react";
import { useNotification } from "@/context/NotificationContext";
import { categoryService, Category } from "@/services/categoryService";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  product?: Product | null;
  mode: "create" | "edit";
}

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  mode,
}) => {
  const { notifyError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    sku: "",
    stock_quantity: "",
    category_id: "",
    season: "",
  });
  const [attributes, setAttributes] = useState<
    { key: string; value: string }[]
  >([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error: any) {
        console.error("Error fetching categories:", error);
        notifyError("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (product && mode === "edit") {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        original_price: product.original_price?.toString() || "",
        sku: product.sku || "",
        stock_quantity: product.stock_quantity?.toString() || "0",
        category_id: product.category_id || "",
        season: product.season || "",
      });
      // Parse attributes for edit mode
      if (product.attributes && typeof product.attributes === "object") {
        const attrs = Object.entries(product.attributes).map(
          ([key, value]) => ({
            key,
            value: String(value),
          }),
        );
        setAttributes(attrs.length > 0 ? attrs : []);
      }
      if (product.images) {
        setImagePreviews(product.images);
      }
    } else {
      // Reset form
      setFormData({
        name: "",
        description: "",
        price: "",
        original_price: "",
        sku: "",
        stock_quantity: "",
        category_id: "",
        season: "",
      });
      setAttributes([]);
      setImages([]);
      setImagePreviews([]);
    }
  }, [product, mode, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imagePreviews.length > 5) {
      notifyError("Maximum 5 images allowed");
      return;
    }

    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price.trim()) newErrors.price = "Price is required";
    else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0)
      newErrors.price = "Invalid price";
    if (!formData.category_id.trim())
      newErrors.category_id = "Category is required";
    if (mode === "create" && images.length === 0)
      newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      if (formData.original_price)
        data.append("original_price", formData.original_price);
      data.append("sku", formData.sku);
      data.append("stock_quantity", formData.stock_quantity || "0");
      data.append("category_id", formData.category_id);
      if (formData.season) data.append("season", formData.season);

      // Convert attributes array to JSON object
      if (attributes.length > 0) {
        const attrsObj = attributes.reduce(
          (acc, { key, value }) => {
            if (key.trim()) acc[key] = value;
            return acc;
          },
          {} as Record<string, string>,
        );
        data.append("attributes", JSON.stringify(attrsObj));
      }

      images.forEach((image) => {
        data.append("images", image);
      });

      await onSubmit(data);
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Create New Product" : "Edit Product"}
      size="lg">
      <form onSubmit={handleSubmit} className={styles.productForm}>
        <div className={styles.formGrid}>
          <div className={styles.fullWidth}>
            <Input
              label="Product Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={errors.name}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className={styles.fullWidth}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          <Input
            label="Price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            error={errors.price}
            placeholder="0.00"
            required
          />

          <Input
            label="Original Price (Optional)"
            type="number"
            step="0.01"
            value={formData.original_price}
            onChange={(e) =>
              handleInputChange("original_price", e.target.value)
            }
            placeholder="0.00"
          />

          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => handleInputChange("sku", e.target.value)}
            placeholder="PROD-001"
          />

          <Input
            label="Stock Quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={(e) =>
              handleInputChange("stock_quantity", e.target.value)
            }
            placeholder="0"
          />

          <div className={styles.fullWidth}>
            <label className={styles.label}>
              Category{" "}
              {errors.category_id && (
                <span className={styles.error}>*{errors.category_id}</span>
              )}
            </label>
            {loadingCategories ? (
              <div className={styles.loadingText}>Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className={styles.warningText}>
                No categories available. Please contact admin to create
                categories.
              </div>
            ) : (
              <select
                className={styles.select}
                value={formData.category_id}
                onChange={(e) =>
                  handleInputChange("category_id", e.target.value)
                }
                required>
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Season */}
          <div className={styles.fullWidth}>
            <label className={styles.label}>Season (Optional)</label>
            <select
              className={styles.select}
              value={formData.season}
              onChange={(e) => handleInputChange("season", e.target.value)}>
              <option value="">Select season</option>
              <option value="spring">Spring</option>
              <option value="summer">Summer</option>
              <option value="autumn">Autumn</option>
              <option value="winter">Winter</option>
              <option value="monsoon">Monsoon</option>
              <option value="rainy">Rainy</option>
            </select>
          </div>

          {/* Attributes - Key/Value Pairs */}
          <div className={styles.fullWidth}>
            <label className={styles.label}>Attributes (Optional)</label>
            {attributes.map((attr, index) => (
              <div key={index} className={styles.attributeRow}>
                <input
                  type="text"
                  className={styles.attributeInput}
                  placeholder="Key (e.g., color)"
                  value={attr.key}
                  onChange={(e) => {
                    const newAttrs = [...attributes];
                    newAttrs[index].key = e.target.value;
                    setAttributes(newAttrs);
                  }}
                />
                <input
                  type="text"
                  className={styles.attributeInput}
                  placeholder="Value (e.g., blue)"
                  value={attr.value}
                  onChange={(e) => {
                    const newAttrs = [...attributes];
                    newAttrs[index].value = e.target.value;
                    setAttributes(newAttrs);
                  }}
                />
                <button
                  type="button"
                  className={styles.removeAttrBtn}
                  onClick={() => {
                    setAttributes(attributes.filter((_, i) => i !== index));
                  }}>
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className={styles.addAttrBtn}
              onClick={() =>
                setAttributes([...attributes, { key: "", value: "" }])
              }>
              + Add Attribute
            </button>
          </div>

          {/* Image Upload */}
          <div className={styles.fullWidth}>
            <label className={styles.label}>
              Product Images{" "}
              {errors.images && (
                <span className={styles.error}>({errors.images})</span>
              )}
            </label>
            <div className={styles.imageUpload}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className={styles.fileInput}
                id="product-images"
                disabled={imagePreviews.length >= 5}
              />
              <label htmlFor="product-images" className={styles.uploadBox}>
                <Upload size={32} />
                <span>Click to upload images</span>
                <span className={styles.uploadHint}>
                  Max 5 images (JPG, PNG)
                </span>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className={styles.imagePreviews}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className={styles.imagePreview}>
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className={styles.removeImage}
                      onClick={() => removeImage(index)}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.formActions}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            icon={<Package size={20} />}>
            {mode === "create" ? "Create Product" : "Update Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductForm;
