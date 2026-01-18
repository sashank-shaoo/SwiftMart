import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of file buffers from Multer
 * @param folder - Cloudinary folder name (default: "products")
 * @returns Promise<string[]> - Array of uploaded image URLs
 */
export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder: string = "products"
): Promise<string[]> => {
  if (!files || files.length === 0) {
    throw new Error("No files provided for upload");
  }

  const uploadPromises = files.map((file) => uploadSingleImage(file, folder));

  try {
    const results = await Promise.all(uploadPromises);
    return results.map((result) => result.secure_url);
  } catch (error) {
    console.error("Error uploading images to Cloudinary:", error);
    throw new Error("Failed to upload images to Cloudinary");
  }
};

/**
 * Upload a single image to Cloudinary
 * @param file - File buffer from Multer
 * @param folder - Cloudinary folder name
 * @returns Promise<UploadApiResponse>
 */
const uploadSingleImage = (
  file: Express.Multer.File,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "profileImages",
        resource_type: "image",
        transformation: [
          { width: 1000, height: 1000, crop: "limit" }, // Limit max dimensions
          { quality: "auto:good" }, // Auto quality optimization
          { fetch_format: "auto" }, // Auto format conversion (WebP when supported)
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error("Upload failed with no result"));
        }
      }
    );

    // Pipe the file buffer to Cloudinary
    uploadStream.end(file.buffer);
  });
};

/**
 * Delete an image from Cloudinary by URL
 * @param imageUrl - Cloudinary image URL
 * @returns Promise<void>
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public_id from Cloudinary URL
    const publicId = extractPublicId(imageUrl);

    if (!publicId) {
      console.warn("Could not extract public_id from URL:", imageUrl);
      return;
    }

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    // Don't throw - this is a cleanup operation
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param imageUrls - Array of Cloudinary image URLs
 */
export const deleteMultipleImages = async (
  imageUrls: string[]
): Promise<void> => {
  const deletePromises = imageUrls.map((url) => deleteImage(url));
  await Promise.allSettled(deletePromises); // Don't fail if some deletions fail
};

/**
 * Extract public_id from Cloudinary URL
 * @param url - Cloudinary image URL
 * @returns public_id or null
 */
const extractPublicId = (url: string): string | null => {
  try {
    const urlParts = url.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) return null;

    // Get everything after "upload/v{version}/" or "upload/"
    const afterUpload = urlParts.slice(uploadIndex + 1);

    // Remove version if present (e.g., "v1234567890")
    const startIndex = afterUpload[0].startsWith("v") ? 1 : 0;

    // Join the remaining parts and remove file extension
    const publicIdWithExt = afterUpload.slice(startIndex).join("/");
    const publicId = publicIdWithExt.substring(
      0,
      publicIdWithExt.lastIndexOf(".")
    );

    return publicId;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
};

export default cloudinary;
