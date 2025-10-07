import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../lib/jwt";
import { prisma } from "../lib/prisma";

export type AuthedRequest = Request & {
  auth?: JwtPayload;
  tenantSlug?: string;
};

/**
 * Middleware to require authentication
 * Validates JWT token and extracts user information
 */
export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  // Try to get token from cookies first, then from Authorization header
  let token = req.cookies.accessToken;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice("Bearer ".length);
    }
  }

  if (!token) {
    return res.status(401).json({
      error: "Missing or invalid access token",
      code: "MISSING_TOKEN",
    });
  }

  try {
    const payload = verifyAccessToken(token);

    // Validate token type
    if (payload.typ !== "access") {
      return res.status(401).json({
        error: "Invalid token type",
        code: "INVALID_TOKEN_TYPE",
      });
    }

    // Optional: ensure path-based tenant matches token tenant claim
    if (req.tenantSlug && payload.ten !== req.tenantSlug) {
      return res.status(403).json({
        error: "Tenant mismatch",
        code: "TENANT_MISMATCH",
      });
    }

    req.auth = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token",
      code: "INVALID_TOKEN",
    });
  }
}

/**
 * Middleware to require specific roles
 * @param roles - Array of allowed roles
 */
export function requireRole(roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    if (!roles.includes(req.auth.rol)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
        required: roles,
        current: req.auth.rol,
      });
    }

    next();
  };
}

/**
 * Middleware to require super admin role
 */
export function requireSuperAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  return requireRole(["SUPER_ADMIN"])(req, res, next);
}

/**
 * Middleware to require institution admin or super admin
 */
export function requireInstitutionAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  return requireRole(["INSTITUTION_ADMIN", "SUPER_ADMIN"])(req, res, next);
}

/**
 * Middleware to validate user is active
 * Checks if user account is still active
 */
export async function requireActiveUser(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.auth) {
    return res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.sub },
      select: { isActive: true, lastLoginAt: true },
    });

    if (!user) {
      return res.status(401).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "Account is deactivated",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    // Update last login time
    await prisma.user.update({
      where: { id: req.auth.sub },
      data: { lastLoginAt: new Date() },
    });

    next();
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
}

/**
 * Middleware to validate tenant access
 * Ensures user belongs to the requested tenant
 */
export function requireTenantAccess(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.auth) {
    return res.status(401).json({
      error: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  if (!req.tenantSlug) {
    return res.status(400).json({
      error: "Tenant slug required",
      code: "TENANT_REQUIRED",
    });
  }

  // For super admin, allow access to any tenant
  if (req.auth.rol === "SUPER_ADMIN") {
    return next();
  }

  // For other roles, validate tenant access through middleware chain
  next();
}
