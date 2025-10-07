import { v2 as cloudinary } from "cloudinary";
import { CloudinaryConfig } from "../types/cloudinary";
import {
  cloudinaryConfig,
  validateCloudinaryConfig,
} from "../config/cloudinary";

// Validate configuration
if (!validateCloudinaryConfig()) {
  throw new Error(
    "Cloudinary configuration is invalid. Please check your environment variables."
  );
}

// Configure Cloudinary
cloudinary.config(cloudinaryConfig);

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  overwrite?: boolean;
  resource_type?: "image" | "video" | "raw" | "auto";
  transformation?: any[];
  tags?: string[];
  context?: Record<string, string>;
}

export class CloudinaryService {
  /**
   * Upload a file to Cloudinary
   */
  static async uploadFile(
    file: any, // Multer file object
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const uploadOptions = {
        folder: options.folder || "lead101",
        public_id: options.public_id,
        overwrite: options.overwrite || false,
        resource_type: options.resource_type || "auto",
        transformation: options.transformation,
        tags: options.tags,
        context: options.context,
      };

      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        uploadOptions
      );

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        created_at: result.created_at,
      };
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload file to Cloudinary");
    }
  }

  /**
   * Upload a file from URL
   */
  static async uploadFromUrl(
    url: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const uploadOptions = {
        folder: options.folder || "lead101",
        public_id: options.public_id,
        overwrite: options.overwrite || false,
        resource_type: options.resource_type || "auto",
        transformation: options.transformation,
        tags: options.tags,
        context: options.context,
      };

      const result = await cloudinary.uploader.upload(url, uploadOptions);

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        created_at: result.created_at,
      };
    } catch (error) {
      console.error("Cloudinary upload from URL error:", error);
      throw new Error("Failed to upload file from URL to Cloudinary");
    }
  }

  /**
   * Delete a file from Cloudinary
   */
  static async deleteFile(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      throw new Error("Failed to delete file from Cloudinary");
    }
  }

  /**
   * Get file information
   */
  static async getFileInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error("Cloudinary get file info error:", error);
      throw new Error("Failed to get file information from Cloudinary");
    }
  }

  /**
   * Generate optimized image URL with transformations
   */
  static generateOptimizedUrl(
    publicId: string,
    transformations: any = {}
  ): string {
    return cloudinary.url(publicId, {
      ...transformations,
      secure: true,
    });
  }

  /**
   * Generate responsive image URLs
   */
  static generateResponsiveUrls(publicId: string): {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  } {
    return {
      thumbnail: cloudinary.url(publicId, {
        width: 150,
        height: 150,
        crop: "fill",
        quality: "auto",
        format: "auto",
      }),
      small: cloudinary.url(publicId, {
        width: 300,
        height: 300,
        crop: "limit",
        quality: "auto",
        format: "auto",
      }),
      medium: cloudinary.url(publicId, {
        width: 600,
        height: 600,
        crop: "limit",
        quality: "auto",
        format: "auto",
      }),
      large: cloudinary.url(publicId, {
        width: 1200,
        height: 1200,
        crop: "limit",
        quality: "auto",
        format: "auto",
      }),
      original: cloudinary.url(publicId, {
        quality: "auto",
        format: "auto",
      }),
    };
  }

  /**
   * Create a signed upload URL for direct client uploads
   */
  static generateSignedUploadUrl(
    folder: string = "lead101",
    publicId?: string
  ): { uploadUrl: string; signature: string; timestamp: number } {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
        public_id: publicId,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      signature,
      timestamp,
    };
  }

  /**
   * List files in a folder
   */
  static async listFiles(
    folder: string,
    options: {
      maxResults?: number;
      nextCursor?: string;
      tags?: string[];
    } = {}
  ): Promise<any> {
    try {
      const result = await cloudinary.api.resources({
        type: "upload",
        prefix: folder,
        max_results: options.maxResults || 50,
        next_cursor: options.nextCursor,
        tags: options.tags,
      });
      return result;
    } catch (error) {
      console.error("Cloudinary list files error:", error);
      throw new Error("Failed to list files from Cloudinary");
    }
  }
}

export default cloudinary;
