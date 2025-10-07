import express from "express";
import multer from "multer";
import { z } from "zod";
import { CloudinaryService } from "../lib/cloudinary";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import {
  AssetUploadRequest,
  AssetDeleteRequest,
  AssetListRequest,
} from "../types/cloudinary";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "application/zip",
      "application/x-rar-compressed",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only images, documents, and archives are allowed."
        )
      );
    }
  },
});

// Validation schemas
const uploadSchema = z.object({
  folder: z.string().optional(),
  tags: z.array(z.string()).optional(),
  context: z.record(z.string(), z.string()).optional(),
  public_id: z.string().optional(),
});

const deleteSchema = z.object({
  public_id: z.string().min(1, "Public ID is required"),
});

const listSchema = z.object({
  folder: z.string().optional(),
  tags: z.array(z.string()).optional(),
  max_results: z.number().min(1).max(500).optional(),
  next_cursor: z.string().optional(),
});

/**
 * Upload a single file
 * POST /api/assets/upload
 */
router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: "NO_FILE",
          message: "No file provided",
        },
      });
    }

    const tenantId = (req as any).user.tenantId;
    const body = uploadSchema.parse(req.body);

    // Upload to Cloudinary
    const uploadResult = await CloudinaryService.uploadFile(req.file, {
      folder: body.folder || `lead101/${tenantId}`,
      tags: body.tags,
      context: body.context || undefined,
      public_id: body.public_id,
    });

    // Generate responsive URLs
    const responsiveUrls = CloudinaryService.generateResponsiveUrls(
      uploadResult.public_id
    );

    // Store asset metadata in database
    const asset = await prisma.asset.create({
      data: {
        tenantId,
        publicId: uploadResult.public_id,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        secureUrl: uploadResult.secure_url,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        folder: body.folder || `lead101/${tenantId}`,
        tags: body.tags ? body.tags.join(",") : "",
        context: body.context ? JSON.stringify(body.context) : "{}",
        uploadedBy: (req as any).user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: asset.id,
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        created_at: uploadResult.created_at,
        responsive_urls: responsiveUrls,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: error.issues,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to upload file",
      },
    });
  }
});

/**
 * Upload multiple files
 * POST /api/assets/upload-multiple
 */
router.post(
  "/upload-multiple",
  requireAuth,
  upload.array("files", 10),
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "NO_FILES",
            message: "No files provided",
          },
        });
      }

      const tenantId = (req as any).user.tenantId;
      const body = uploadSchema.parse(req.body);

      const uploadPromises = files.map(async (file) => {
        const uploadResult = await CloudinaryService.uploadFile(file, {
          folder: body.folder || `lead101/${tenantId}`,
          tags: body.tags,
          context: body.context || undefined,
        });

        const responsiveUrls = CloudinaryService.generateResponsiveUrls(
          uploadResult.public_id
        );

        // Store asset metadata in database
        const asset = await prisma.asset.create({
          data: {
            tenantId,
            publicId: uploadResult.public_id,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
            secureUrl: uploadResult.secure_url,
            format: uploadResult.format,
            width: uploadResult.width,
            height: uploadResult.height,
            bytes: uploadResult.bytes,
            folder: body.folder || `lead101/${tenantId}`,
            tags: body.tags ? body.tags.join(",") : "",
            context: body.context ? JSON.stringify(body.context) : "{}",
            uploadedBy: (req as any).user.id,
          },
        });

        return {
          id: asset.id,
          public_id: uploadResult.public_id,
          secure_url: uploadResult.secure_url,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
          bytes: uploadResult.bytes,
          created_at: uploadResult.created_at,
          responsive_urls: responsiveUrls,
        };
      });

      const results = await Promise.all(uploadPromises);

      res.status(201).json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error("Multiple upload error:", error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input data",
            details: error.issues,
          },
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: "UPLOAD_ERROR",
          message:
            error instanceof Error ? error.message : "Failed to upload files",
        },
      });
    }
  }
);

/**
 * Delete a file
 * DELETE /api/assets/:publicId
 */
router.delete("/:publicId", requireAuth, async (req, res) => {
  try {
    const { publicId } = req.params;
    const tenantId = (req as any).user.tenantId;

    // Verify asset belongs to tenant
    const asset = await prisma.asset.findFirst({
      where: {
        publicId,
        tenantId,
      },
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: {
          code: "ASSET_NOT_FOUND",
          message: "Asset not found",
        },
      });
    }

    // Delete from Cloudinary
    const deleted = await CloudinaryService.deleteFile(publicId);

    if (deleted) {
      // Remove from database
      await prisma.asset.delete({
        where: { id: asset.id },
      });

      res.json({
        success: true,
        data: {
          deleted: true,
          public_id: publicId,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: "DELETE_ERROR",
          message: "Failed to delete file from Cloudinary",
        },
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "DELETE_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to delete file",
      },
    });
  }
});

/**
 * List assets
 * GET /api/assets
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const query = req.query;

    const where: any = { tenantId };

    if (query.folder) {
      where.folder = query.folder;
    }

    if (query.tags) {
      where.tags = {
        contains: Array.isArray(query.tags) ? query.tags[0] : query.tags,
      };
    }

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Math.min(parseInt(query.limit as string) || 50, 100),
      skip: parseInt(query.offset as string) || 0,
    });

    res.json({
      success: true,
      data: {
        assets: assets.map((asset) => ({
          id: asset.id,
          public_id: asset.publicId,
          secure_url: asset.secureUrl,
          format: asset.format,
          width: asset.width,
          height: asset.height,
          bytes: asset.bytes,
          folder: asset.folder,
          tags: asset.tags.split(",").filter((tag) => tag.trim()),
          context: asset.context,
          created_at: asset.createdAt,
          responsive_urls: CloudinaryService.generateResponsiveUrls(
            asset.publicId
          ),
        })),
        total: assets.length,
      },
    });
  } catch (error) {
    console.error("List assets error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "LIST_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to list assets",
      },
    });
  }
});

/**
 * Get asset details
 * GET /api/assets/:publicId
 */
router.get("/:publicId", requireAuth, async (req, res) => {
  try {
    const { publicId } = req.params;
    const tenantId = (req as any).user.tenantId;

    const asset = await prisma.asset.findFirst({
      where: {
        publicId,
        tenantId,
      },
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        error: {
          code: "ASSET_NOT_FOUND",
          message: "Asset not found",
        },
      });
    }

    res.json({
      success: true,
      data: {
        id: asset.id,
        public_id: asset.publicId,
        secure_url: asset.secureUrl,
        format: asset.format,
        width: asset.width,
        height: asset.height,
        bytes: asset.bytes,
        folder: asset.folder,
        tags: asset.tags.split(",").filter((tag) => tag.trim()),
        context: asset.context,
        created_at: asset.createdAt,
        responsive_urls: CloudinaryService.generateResponsiveUrls(
          asset.publicId
        ),
      },
    });
  } catch (error) {
    console.error("Get asset error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "GET_ERROR",
        message: error instanceof Error ? error.message : "Failed to get asset",
      },
    });
  }
});

/**
 * Generate signed upload URL for direct client uploads
 * POST /api/assets/signed-url
 */
router.post("/signed-url", requireAuth, async (req, res) => {
  try {
    const { folder, public_id } = req.body;
    const tenantId = (req as any).user.tenantId;

    const signedData = CloudinaryService.generateSignedUploadUrl(
      folder || `lead101/${tenantId}`,
      public_id
    );

    res.json({
      success: true,
      data: signedData,
    });
  } catch (error) {
    console.error("Generate signed URL error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SIGNED_URL_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate signed URL",
      },
    });
  }
});

export default router;
