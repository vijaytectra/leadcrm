import express from "express";
import multer from "multer";
import { z } from "zod";
import { CloudinaryService } from "../lib/cloudinary";
import {
  requireAuth,
  requireActiveUser,
  requireRole,
  AuthedRequest,
} from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
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
      "application/rtf",
      "application/vnd.oasis.opendocument.text",
      "application/vnd.oasis.opendocument.spreadsheet",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only images, documents, and text files are allowed."
        )
      );
    }
  },
});

// Validation schemas
const documentUploadSchema = z.object({
  applicationId: z.string().optional(),
  documentTypeId: z.string().optional(),
  description: z.string().optional(),
});

const documentTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z
    .enum(["GENERAL", "ACADEMIC", "IDENTITY", "FINANCIAL"])
    .default("GENERAL"),
  isRequired: z.boolean().default(true),
  maxFileSize: z
    .number()
    .int()
    .min(1024)
    .max(50 * 1024 * 1024)
    .default(10485760), // 10MB
  allowedFormats: z.array(z.string()).default([]),
});

const documentVerificationSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  comments: z.string().optional(),
  rejectionReason: z.string().optional(),
});

const batchVerificationSchema = z.object({
  documentIds: z
    .array(z.string())
    .min(1, "At least one document ID is required"),
  status: z.enum(["VERIFIED", "REJECTED"]),
  comments: z.string().optional(),
  rejectionReason: z.string().optional(),
});

/**
 * POST /api/:tenant/documents/upload
 * Upload a single document
 */
router.post(
  "/:tenant/documents/upload",
  requireAuth,
  requireActiveUser,
  requireRole(["DOCUMENT_VERIFIER", "INSTITUTION_ADMIN", "STUDENT", "PARENT"]),
  upload.single("file"),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const body = documentUploadSchema.parse(req.body);

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: "NO_FILE",
            message: "No file provided",
          },
        });
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      // Upload to Cloudinary
      const uploadResult = await CloudinaryService.uploadFile(req.file, {
        folder: `lead101/${tenant.id}/documents`,
        tags: ["document"],
        context: {
              uploadedBy: req.auth?.sub || "",
          applicationId: body.applicationId || "",
        },
      });

      // Create document record
      const document = await prisma.document.create({
        data: {
          tenantId: tenant.id,
          applicationId: body.applicationId,
          documentTypeId: body.documentTypeId,
          fileName: req.file.originalname,
          filePath: uploadResult.secure_url,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          status: "UPLOADED",
        },
        include: {
          documentType: true,
          verifier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error("Document upload error:", error);

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
            error instanceof Error
              ? error.message
              : "Failed to upload document",
        },
      });
    }
  }
);

/**
 * POST /api/:tenant/documents/upload-multiple
 * Upload multiple documents
 */
router.post(
  "/:tenant/documents/upload-multiple",
  requireAuth,
  requireActiveUser,
  requireRole(["DOCUMENT_VERIFIER", "INSTITUTION_ADMIN", "STUDENT", "PARENT"]),
  upload.array("files", 10),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const body = documentUploadSchema.parse(req.body);
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

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      const uploadPromises = files.map(async (file) => {
        const uploadResult = await CloudinaryService.uploadFile(file, {
          folder: `lead101/${tenant.id}/documents`,
          tags: ["document"],
          context: {
            uploadedBy: req.auth?.sub || "",
            applicationId: body.applicationId || "",
          },
        });

        return prisma.document.create({
          data: {
            tenantId: tenant.id,
            applicationId: body.applicationId,
            documentTypeId: body.documentTypeId,
            fileName: file.originalname,
            filePath: uploadResult.secure_url,
            fileType: file.mimetype,
            fileSize: file.size,
            status: "UPLOADED",
          },
          include: {
            documentType: true,
            verifier: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });
      });

      const documents = await Promise.all(uploadPromises);

      res.status(201).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      console.error("Multiple document upload error:", error);

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
            error instanceof Error
              ? error.message
              : "Failed to upload documents",
        },
      });
    }
  }
);

/**
 * GET /api/:tenant/documents/queue
 * Get documents pending verification
 */
router.get(
  "/:tenant/documents/queue",
  requireAuth,
  requireActiveUser,
  requireRole(["DOCUMENT_VERIFIER", "INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const { status, page = "1", limit = "20" } = req.query;

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      const where: any = {
        tenantId: tenant.id,
        status: status || "UPLOADED",
      };

      const documents = await prisma.document.findMany({
        where,
        include: {
          documentType: true,
          application: {
            select: {
              id: true,
              studentName: true,
              studentEmail: true,
            },
          },
          verifier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
      });

      const total = await prisma.document.count({ where });

      res.json({
        success: true,
        data: {
          documents,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            pages: Math.ceil(total / parseInt(limit as string)),
          },
        },
      });
    } catch (error) {
      console.error("Get document queue error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch document queue",
        },
      });
    }
  }
);

/**
 * POST /api/:tenant/documents/:id/verify
 * Verify or reject a document
 */
router.post(
  "/:tenant/documents/:id/verify",
  requireAuth,
  requireActiveUser,
  requireRole(["DOCUMENT_VERIFIER", "INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const documentId = req.params.id;
      const body = documentVerificationSchema.parse(req.body);

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      // Update document status
      const updateData: any = {
        status: body.status,
        verifierId: req.auth?.sub,
      };

      if (body.status === "VERIFIED") {
        updateData.verifiedAt = new Date();
      } else if (body.status === "REJECTED") {
        updateData.rejectedAt = new Date();
        updateData.rejectionReason = body.rejectionReason;
      }

      const document = await prisma.document.update({
        where: {
          id: documentId,
          tenantId: tenant.id,
        },
        data: updateData,
        include: {
          documentType: true,
          application: {
            select: {
              id: true,
              studentName: true,
              studentEmail: true,
            },
          },
          verifier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error("Document verification error:", error);

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
          code: "VERIFICATION_ERROR",
          message: "Failed to verify document",
        },
      });
    }
  }
);

/**
 * POST /api/:tenant/documents/batch-verify
 * Batch verify multiple documents
 */
router.post(
  "/:tenant/documents/batch-verify",
  requireAuth,
  requireActiveUser,
  requireRole(["DOCUMENT_VERIFIER", "INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const body = batchVerificationSchema.parse(req.body);

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      const updateData: any = {
        status: body.status,
        verifierId: req.auth?.sub,
      };

      if (body.status === "VERIFIED") {
        updateData.verifiedAt = new Date();
      } else if (body.status === "REJECTED") {
        updateData.rejectedAt = new Date();
        updateData.rejectionReason = body.rejectionReason;
      }

      const result = await prisma.document.updateMany({
        where: {
          id: { in: body.documentIds },
          tenantId: tenant.id,
        },
        data: updateData,
      });

      res.json({
        success: true,
        data: {
          updatedCount: result.count,
          documentIds: body.documentIds,
        },
      });
    } catch (error) {
      console.error("Batch verification error:", error);

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
          code: "BATCH_VERIFICATION_ERROR",
          message: "Failed to batch verify documents",
        },
      });
    }
  }
);

/**
 * GET /api/:tenant/documents/:id
 * Get document details
 */
router.get(
  "/:tenant/documents/:id",
  requireAuth,
  requireActiveUser,
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const documentId = req.params.id;

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          tenantId: tenant.id,
        },
        include: {
          documentType: true,
          application: {
            select: {
              id: true,
              studentName: true,
              studentEmail: true,
            },
          },
          verifier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          error: {
            code: "DOCUMENT_NOT_FOUND",
            message: "Document not found",
          },
        });
      }

      res.json({
        success: true,
        data: document,
      });
    } catch (error) {
      console.error("Get document error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch document",
        },
      });
    }
  }
);

/**
 * DELETE /api/:tenant/documents/:id
 * Delete a document
 */
router.delete(
  "/:tenant/documents/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["DOCUMENT_VERIFIER", "INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const documentId = req.params.id;

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      // Get document first to extract Cloudinary public ID
      const document = await prisma.document.findFirst({
        where: {
          id: documentId,
          tenantId: tenant.id,
        },
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          error: {
            code: "DOCUMENT_NOT_FOUND",
            message: "Document not found",
          },
        });
      }

      // Extract public ID from Cloudinary URL
      const publicId = document.filePath.split("/").pop()?.split(".")[0];

      if (publicId) {
        // Delete from Cloudinary
        await CloudinaryService.deleteFile(publicId);
      }

      // Delete from database
      await prisma.document.delete({
        where: { id: documentId },
      });

      res.json({
        success: true,
        data: {
          deleted: true,
          documentId,
        },
      });
    } catch (error) {
      console.error("Delete document error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "DELETE_ERROR",
          message: "Failed to delete document",
        },
      });
    }
  }
);

/**
 * POST /api/:tenant/document-types
 * Create a new document type
 */
router.post(
  "/:tenant/document-types",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const body = documentTypeSchema.parse(req.body);

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      const documentType = await prisma.documentType.create({
        data: {
          tenantId: tenant.id,
          ...body,
        },
        include: {
          checklists: true,
        },
      });

      res.status(201).json({
        success: true,
        data: documentType,
      });
    } catch (error) {
      console.error("Create document type error:", error);

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
          code: "CREATE_ERROR",
          message: "Failed to create document type",
        },
      });
    }
  }
);

/**
 * GET /api/:tenant/document-types
 * Get all document types for tenant
 */
router.get(
  "/:tenant/document-types",
  requireAuth,
  requireActiveUser,
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        });
      }

      const documentTypes = await prisma.documentType.findMany({
        where: {
          tenantId: tenant.id,
          isActive: true,
        },
        include: {
          checklists: {
            where: { isActive: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { name: "asc" },
      });

      res.json({
        success: true,
        data: documentTypes,
      });
    } catch (error) {
      console.error("Get document types error:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch document types",
        },
      });
    }
  }
);

export default router;
