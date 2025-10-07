import { CloudinaryConfig } from "../types/cloudinary";
import dotenv from "dotenv";
dotenv.config();

export const cloudinaryConfig: CloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
};

export const uploadConfig = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB default
  allowedFileTypes: (
    process.env.ALLOWED_FILE_TYPES ||
    "image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip,application/x-rar-compressed"
  ).split(","),
  defaultFolder: "lead101",
  imageTransformations: {
    thumbnail: {
      width: 150,
      height: 150,
      crop: "fill",
      quality: "auto",
      format: "auto",
    },
    small: {
      width: 300,
      height: 300,
      crop: "limit",
      quality: "auto",
      format: "auto",
    },
    medium: {
      width: 600,
      height: 600,
      crop: "limit",
      quality: "auto",
      format: "auto",
    },
    large: {
      width: 1200,
      height: 1200,
      crop: "limit",
      quality: "auto",
      format: "auto",
    },
  },
};

export const validateCloudinaryConfig = (): boolean => {
  const required = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  const missing = required.filter((key) => !process.env[key]);


  if (missing.length > 0) {
    console.error(
      `Missing required Cloudinary environment variables: ${missing.join(", ")}`
    );
    return false;
  }

  return true;
};
