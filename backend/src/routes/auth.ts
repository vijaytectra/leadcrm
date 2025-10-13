import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from "../lib/jwt";
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  generateSecurePassword,
} from "../lib/password";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { generatePasswordResetEmail } from "../lib/email-templates";
import { emailService } from "../lib/email";
import { z } from "zod";

const router = Router();

// Validation schemas
const loginSchema = z.object({
  tenant: z.string().min(1, "Tenant slug is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const requestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email format"),
  tenant: z.string().min(1, "Tenant slug is required"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

/**
 * POST /api/auth/login
 * Authenticate user and return access/refresh tokens
 */
router.post("/auth/login", async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues,
        code: "VALIDATION_ERROR",
      });
    }

    const { tenant, email, password } = validation.data;

  

    // Find user with tenant
    const user = await prisma.user.findFirst({
      where: {
        email,
        tenant: { slug: tenant },
        isActive: true,
      },
      include: { tenant: true },
    });
 

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Generate tokens
    const accessToken = signAccessToken({
      sub: user.id,
      ten: user.tenantId,
      rol: user.role,
    });

    const refreshToken = signRefreshToken({
      sub: user.id,
      ten: user.tenantId,
      rol: user.role,
    });

    // Store refresh token
    const refreshHash = await hashPassword(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshHash,
        expiresAt,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Set secure cookies
    const cookieOptions = {
      httpOnly: false, // Allow JavaScript access for frontend
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const, // More permissive for cross-origin
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    };

    const refreshCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
        tenantSlug: user.tenant.slug,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post("/auth/refresh", async (req, res) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: "No refresh token provided",
        code: "NO_REFRESH_TOKEN",
      });
    }

    const payload = verifyRefreshToken(refreshToken);

    // Find valid refresh tokens
    const tokens = await prisma.refreshToken.findMany({
      where: { userId: payload.sub, revoked: false },
    });

    let matchId: string | null = null;
    for (const token of tokens) {
      const isValid = await comparePassword(refreshToken, token.tokenHash);
      if (isValid && token.expiresAt > new Date()) {
        matchId = token.id;
        break;
      }
    }

    if (!matchId) {
      return res.status(401).json({
        error: "Invalid or expired refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: matchId },
      data: { revoked: true },
    });

    // Generate new tokens
    const newAccessToken = signAccessToken({
      sub: payload.sub,
      ten: payload.ten,
      rol: payload.rol,
    });

    const newRefreshToken = signRefreshToken({
      sub: payload.sub,
      ten: payload.ten,
      rol: payload.rol,
    });

    // Store new refresh token
    const refreshHash = await hashPassword(newRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        tokenHash: refreshHash,
        expiresAt,
      },
    });

    // Set new secure cookies
    const cookieOptions = {
      httpOnly: false, // Allow JavaScript access for frontend
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const, // More permissive for cross-origin
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    };

    const refreshCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };

    res.cookie("accessToken", newAccessToken, cookieOptions);
    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

    res.json({ success: true });
  } catch (error) {
    console.error("Refresh error:", error);
    res.status(401).json({
      error: "Invalid refresh token",
      code: "INVALID_REFRESH_TOKEN",
    });
  }
});

/**
 * POST /api/auth/logout
 * Revoke refresh token
 */
router.post("/auth/logout", async (req, res) => {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      // Clear cookies even if no refresh token
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.json({ success: true });
    }

    // Find and revoke refresh token
    const tokens = await prisma.refreshToken.findMany({
      where: { revoked: false },
    });

    for (const token of tokens) {
      const isValid = await comparePassword(refreshToken, token.tokenHash);
      if (isValid) {
        await prisma.refreshToken.update({
          where: { id: token.id },
          data: { revoked: true },
        });
        break;
      }
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post(
  "/auth/change-password",
  requireAuth,
  async (req: AuthedRequest, res) => {
    try {
      const validation = changePasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const { currentPassword, newPassword } = validation.data;

      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: "Password does not meet requirements",
          details: passwordValidation.errors,
          code: "WEAK_PASSWORD",
        });
      }

      if (!req.auth) {
        return res.status(401).json({
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      // Get current user
      const user = await prisma.user.findUnique({
        where: { id: req.auth.sub },
        select: { passwordHash: true },
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      // Verify current password
      const isValidCurrentPassword = await comparePassword(
        currentPassword,
        user.passwordHash
      );
      if (!isValidCurrentPassword) {
        return res.status(400).json({
          error: "Current password is incorrect",
          code: "INVALID_CURRENT_PASSWORD",
        });
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: req.auth.sub },
        data: { passwordHash: newPasswordHash },
      });

      // Revoke all refresh tokens for security
      await prisma.refreshToken.updateMany({
        where: { userId: req.auth.sub },
        data: { revoked: true },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get("/auth/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    if (!req.auth) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.auth.sub },
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
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
            subscriptionTier: true,
            subscriptionStatus: true,
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
});

/**
 * POST /api/auth/request-password-reset
 * Request password reset
 */
router.post("/auth/request-password-reset", async (req, res) => {
  try {
    const validation = requestPasswordResetSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues,
        code: "VALIDATION_ERROR",
      });
    }

    const { email, tenant } = validation.data;

    // Find user with tenant
    const user = await prisma.user.findFirst({
      where: {
        email,
        tenant: { slug: tenant },
        isActive: true,
      },
      include: { tenant: true },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: "If the email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = signAccessToken({
      sub: user.id,
      ten: user.tenantId,
      rol: user.role,
      type: "password_reset",
    });

    // Store reset token with expiration (1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await hashPassword(resetToken),
        expiresAt,
      },
    });

    // Generate reset URL
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${resetToken}`;

    // Send password reset email
    const emailTemplate = generatePasswordResetEmail(
      user.email,
      resetUrl,
      user.tenant.name
    );

    // Check email service status
    const emailStatus = emailService.getStatus();

    // Send the email using SendGrid
    const emailSent = await emailService.sendEmail(
      user.email,
      emailTemplate.subject,
      emailTemplate.html,
      emailTemplate.text
    );

    if (!emailSent) {
      console.error("Failed to send password reset email to:", user.email);
      console.error("Email service configured:", emailStatus.configured);
      console.error("Email service ready:", emailStatus.ready);
      // Don't fail the request, just log the error
    }

    res.json({
      success: true,
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({
      error: "Failed to process password reset request",
      code: "PASSWORD_RESET_ERROR",
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post("/auth/reset-password", async (req, res) => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues,
        code: "VALIDATION_ERROR",
      });
    }

    const { token, newPassword } = validation.data;

    // Verify reset token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
      if (decoded.type !== "password_reset") {
        throw new Error("Invalid token type");
      }
    } catch (error) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
        code: "INVALID_RESET_TOKEN",
      });
    }

    // Check if reset token exists and is valid
    const resetTokenRecord = await prisma.refreshToken.findFirst({
      where: {
        userId: decoded.sub,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!resetTokenRecord) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
        code: "INVALID_RESET_TOKEN",
      });
    }

    // Verify the token hash
    const isValidToken = await comparePassword(
      token,
      resetTokenRecord.tokenHash
    );
    if (!isValidToken) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
        code: "INVALID_RESET_TOKEN",
      });
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: decoded.sub },
      data: { passwordHash: hashedPassword },
    });

    // Revoke all refresh tokens for this user
    await prisma.refreshToken.updateMany({
      where: { userId: decoded.sub },
      data: { revoked: true },
    });

    // Log the password reset
    await prisma.auditLog.create({
      data: {
        tenantId: decoded.ten,
        userId: decoded.sub,
        action: "PASSWORD_RESET",
        entity: "User",
        entityId: decoded.sub,
        newValues: { passwordChanged: true },
      },
    });

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      error: "Failed to reset password",
      code: "RESET_PASSWORD_ERROR",
    });
  }
});

/**
 * GET /api/auth/test-email
 * Test email service configuration
 */
router.get("/auth/test-email", async (req, res) => {
  try {
    const emailStatus = emailService.getStatus();

    res.json({
      success: true,
      emailService: emailStatus,
      environment: {
        sendgridApiKey: process.env.SENDGRID_API_KEY ? "Present" : "Missing",
        sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || "Missing",
        sendgridFromName: process.env.SENDGRID_FROM_NAME || "Missing",
      },
    });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({
      error: "Failed to test email service",
      code: "EMAIL_TEST_ERROR",
    });
  }
});

export default router;
