import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  requireRole,
  requireInstitutionAdmin,
  requireActiveUser,
  requireTenantAccess,
  AuthedRequest,
} from "../middleware/auth";
import { hashPassword, generateSecurePassword } from "../lib/password";
import { z } from "zod";

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  role: z.enum([
    "INSTITUTION_ADMIN",
    "TELECALLER",
    "DOCUMENT_VERIFIER",
    "FINANCE_TEAM",
    "ADMISSION_TEAM",
    "ADMISSION_HEAD",
  ]),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z
    .enum([
      "INSTITUTION_ADMIN",
      "TELECALLER",
      "DOCUMENT_VERIFIER",
      "FINANCE_TEAM",
      "ADMISSION_TEAM",
      "ADMISSION_HEAD",
    ])
    .optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/:tenant/users
 * Get all users for a tenant (Institution Admin or Super Admin only)
 */
router.get(
  "/:tenant/users",
  requireAuth,
  requireActiveUser,
  requireInstitutionAdmin,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // For super admin, allow access to any tenant
      // For institution admin, validate tenant access
      if (
        req.auth?.rol === "INSTITUTION_ADMIN" &&
        req.auth.ten !== tenantSlug
      ) {
        return res.status(403).json({
          error: "Access denied to this tenant",
          code: "TENANT_ACCESS_DENIED",
        });
      }

      const users = await prisma.user.findMany({
        where: {
          tenant: { slug: tenantSlug },
          // Don't show super admin users to institution admins
          ...(req.auth?.rol === "INSTITUTION_ADMIN" && {
            role: { not: "SUPER_ADMIN" },
          }),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ users });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * POST /api/:tenant/users
 * Create a new user (Institution Admin or Super Admin only)
 */
router.post(
  "/:tenant/users",
  requireAuth,
  requireActiveUser,
  requireInstitutionAdmin,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const validation = createUserSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const { email, firstName, lastName, phone, role, password } =
        validation.data;

      // Check if tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          error: "User with this email already exists",
          code: "USER_EXISTS",
        });
      }

      // Generate password if not provided
      const userPassword = password || generateSecurePassword(12);
      const passwordHash = await hashPassword(userPassword);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          phone,
          passwordHash,
          role,
          tenantId: tenant.id,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      res.status(201).json({
        user,
        // Only return password if it was generated (not provided)
        ...(password ? {} : { generatedPassword: userPassword }),
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/:tenant/users/:userId
 * Get specific user details
 */
router.get(
  "/:tenant/users/:userId",
  requireAuth,
  requireActiveUser,
  requireInstitutionAdmin,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenant: tenantSlug, userId } = req.params;

      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          tenant: { slug: tenantSlug },
          // Don't show super admin users to institution admins
          ...(req.auth?.rol === "INSTITUTION_ADMIN" && {
            role: { not: "SUPER_ADMIN" },
          }),
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          tenant: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * PUT /api/:tenant/users/:userId
 * Update user details
 */
router.put(
  "/:tenant/users/:userId",
  requireAuth,
  requireActiveUser,
  requireInstitutionAdmin,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenant: tenantSlug, userId } = req.params;
      const validation = updateUserSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const updateData = validation.data;

      // Check if user exists and belongs to tenant
      const existingUser = await prisma.user.findFirst({
        where: {
          id: userId,
          tenant: { slug: tenantSlug },
          // Don't allow institution admins to modify super admin users
          ...(req.auth?.rol === "INSTITUTION_ADMIN" && {
            role: { not: "SUPER_ADMIN" },
          }),
        },
      });

      if (!existingUser) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      // Update user
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({ user });
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * DELETE /api/:tenant/users/:userId
 * Deactivate user (soft delete)
 */
router.delete(
  "/:tenant/users/:userId",
  requireAuth,
  requireActiveUser,
  requireInstitutionAdmin,
  requireTenantAccess,
  async (req: AuthedRequest, res) => {
    try {
      const { tenant: tenantSlug, userId } = req.params;

      // Prevent self-deletion
      if (req.auth?.sub === userId) {
        return res.status(400).json({
          error: "Cannot deactivate your own account",
          code: "SELF_DELETE_NOT_ALLOWED",
        });
      }

      // Check if user exists and belongs to tenant
      const existingUser = await prisma.user.findFirst({
        where: {
          id: userId,
          tenant: { slug: tenantSlug },
          // Don't allow institution admins to modify super admin users
          ...(req.auth?.rol === "INSTITUTION_ADMIN" && {
            role: { not: "SUPER_ADMIN" },
          }),
        },
      });

      if (!existingUser) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      // Soft delete by deactivating
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      // Revoke all refresh tokens
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

export default router;
