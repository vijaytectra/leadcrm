import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Validation schemas
const assignRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum([
    "SUPER_ADMIN",
    "INSTITUTION_ADMIN",
    "TELECALLER",
    "DOCUMENT_VERIFIER",
    "FINANCE_TEAM",
    "ADMISSION_TEAM",
    "ADMISSION_HEAD",
    "STUDENT",
    "PARENT",
  ]),
});

const updatePermissionsSchema = z.object({
  role: z.enum([
    "SUPER_ADMIN",
    "INSTITUTION_ADMIN",
    "TELECALLER",
    "DOCUMENT_VERIFIER",
    "FINANCE_TEAM",
    "ADMISSION_TEAM",
    "ADMISSION_HEAD",
    "STUDENT",
    "PARENT",
  ]),
  permissionIds: z
    .array(z.string())
    .min(1, "At least one permission is required"),
});

/**
 * GET /api/roles/permissions
 * Get all available permissions
 */
router.get(
  "/roles/permissions",
  requireAuth,
  async (req: AuthedRequest, res) => {
    try {
      const permissions = await prisma.permission.findMany({
        orderBy: [{ resource: "asc" }, { action: "asc" }],
      });

      // Group permissions by resource
      const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.resource]) {
          acc[permission.resource] = [];
        }
        acc[permission.resource].push(permission);
        return acc;
      }, {} as Record<string, typeof permissions>);

      res.json({
        success: true,
        data: {
          permissions,
          groupedPermissions,
        },
      });
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({
        error: "Failed to fetch permissions",
        code: "FETCH_PERMISSIONS_ERROR",
      });
    }
  }
);

/**
 * GET /api/roles/:role/permissions
 * Get permissions for a specific role
 */
router.get(
  "/roles/:role/permissions",
  requireAuth,
  async (req: AuthedRequest, res) => {
    try {
      const { role } = req.params;

      const rolePermissions = await prisma.rolePermission.findMany({
        where: { role: role as any },
        include: {
          permission: true,
        },
      });

      res.json({
        success: true,
        data: rolePermissions.map((rp) => rp.permission),
      });
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({
        error: "Failed to fetch role permissions",
        code: "FETCH_ROLE_PERMISSIONS_ERROR",
      });
    }
  }
);

/**
 * POST /api/roles/assign
 * Assign a role to a user
 */
router.post("/roles/assign", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const validation = assignRoleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues,
        code: "VALIDATION_ERROR",
      });
    }

    const { userId, role } = validation.data;

    // Check if user exists and belongs to the same tenant
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: req.auth!.ten,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Log the role assignment
    await prisma.auditLog.create({
      data: {
        tenantId: req.auth!.ten,
        userId: req.auth!.sub,
        action: "ROLE_ASSIGNED",
        entity: "User",
        entityId: userId,
        newValues: { role },
      },
    });

    res.json({
      success: true,
      message: "Role assigned successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error assigning role:", error);
    res.status(500).json({
      error: "Failed to assign role",
      code: "ASSIGN_ROLE_ERROR",
    });
  }
});

/**
 * PUT /api/roles/permissions
 * Update permissions for a role
 */
router.put(
  "/roles/permissions",
  requireAuth,
  async (req: AuthedRequest, res) => {
    try {
      const validation = updatePermissionsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const { role, permissionIds } = validation.data;

      // Verify all permissions exist
      const permissions = await prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });

      if (permissions.length !== permissionIds.length) {
        return res.status(400).json({
          error: "One or more permissions not found",
          code: "INVALID_PERMISSIONS",
        });
      }

      // Delete existing role permissions
      await prisma.rolePermission.deleteMany({
        where: { role: role as any },
      });

      // Create new role permissions
      const rolePermissions = permissionIds.map((permissionId) => ({
        role: role as any,
        permissionId,
      }));

      await prisma.rolePermission.createMany({
        data: rolePermissions,
      });

      // Log the permission update
      await prisma.auditLog.create({
        data: {
          tenantId: req.auth!.ten,
          userId: req.auth!.sub,
          action: "ROLE_PERMISSIONS_UPDATED",
          entity: "Role",
          entityId: role,
          newValues: { permissionIds },
        },
      });

      res.json({
        success: true,
        message: "Role permissions updated successfully",
      });
    } catch (error) {
      console.error("Error updating role permissions:", error);
      res.status(500).json({
        error: "Failed to update role permissions",
        code: "UPDATE_ROLE_PERMISSIONS_ERROR",
      });
    }
  }
);

/**
 * GET /api/roles/users
 * Get all users with their roles
 */
router.get("/roles/users", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        tenantId: req.auth!.ten,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      code: "FETCH_USERS_ERROR",
    });
  }
});

export default router;
