import { prisma } from "./prisma";
import { randomBytes } from "crypto";
import { z } from "zod";

// Validation schemas
const createFormAccessSchema = z.object({
  leadId: z.string().min(1),
  admissionFormId: z.string().min(1),
  email: z.string().email(),
  tenantId: z.string().min(1),
});

const updateFormProgressSchema = z.object({
  progressData: z.record(z.string(), z.any()).optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "SUBMITTED"]).optional(),
});

const submitFormSchema = z.object({
  formData: z.record(z.string(), z.any()),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Types
export interface StudentFormAccessData {
  id: string;
  leadId: string;
  admissionFormId: string;
  accessToken: string;
  email: string;
  tenantId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED";
  progressData?: any;
  lastAccessedAt?: Date;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormAccessWithDetails extends StudentFormAccessData {
  lead: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  admissionForm: {
    id: string;
    title: string;
    description: string | null;
    isPublished: boolean;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
}

export class StudentFormAccessService {
  /**
   * Create form access for a lead
   */
  static async createFormAccess(data: {
    leadId: string;
    admissionFormId: string;
    email: string;
    tenantId: string;
  }): Promise<StudentFormAccessData> {
    const validatedData = createFormAccessSchema.parse(data);

    // Check if access already exists for this lead
    const existingAccess = await prisma.studentFormAccess.findUnique({
      where: { leadId: validatedData.leadId },
    });

    if (existingAccess) {
      // Update existing access if form is different
      if (existingAccess.admissionFormId !== validatedData.admissionFormId) {
        const updatedAccess = await prisma.studentFormAccess.update({
          where: { id: existingAccess.id },
          data: {
            admissionFormId: validatedData.admissionFormId,
            accessToken: this.generateAccessToken(),
            status: "NOT_STARTED",
            progressData: undefined,
            lastAccessedAt: null,
            submittedAt: null,
          },
        });
        return updatedAccess as StudentFormAccessData;
      }
      return existingAccess as StudentFormAccessData;
    }

    // Create new access
    const access = await prisma.studentFormAccess.create({
      data: {
        leadId: validatedData.leadId,
        admissionFormId: validatedData.admissionFormId,
        email: validatedData.email,
        tenantId: validatedData.tenantId,
        accessToken: this.generateAccessToken(),
        status: "NOT_STARTED",
      },
    });

    return access as StudentFormAccessData;
  }

  /**
   * Get form access by token
   */
  static async getFormAccessByToken(
    accessToken: string
  ): Promise<FormAccessWithDetails | null> {
    const access = await prisma.studentFormAccess.findUnique({
      where: { accessToken },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        admissionForm: {
          select: {
            id: true,
            title: true,
            description: true,
            isPublished: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return access as FormAccessWithDetails;
  }

  /**
   * Update form progress
   */
  static async updateFormProgress(
    accessToken: string,
    progressData: any,
    status?: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED"
  ): Promise<StudentFormAccessData> {
    const validatedData = updateFormProgressSchema.parse({
      progressData,
      status,
    });

    const access = await prisma.studentFormAccess.update({
      where: { accessToken },
      data: {
        progressData: (validatedData.progressData as any) || undefined,
        status: validatedData.status || "IN_PROGRESS",
        lastAccessedAt: new Date(),
      },
    });

    return access as StudentFormAccessData;
  }

  /**
   * Submit form
   */
  static async submitForm(
    accessToken: string,
    formData: any,
    metadata?: any
  ): Promise<{ success: boolean; submissionId?: string; error?: string }> {
    try {
      const validatedData = submitFormSchema.parse({
        formData,
        metadata,
      });

      // Get access details
      const access = await this.getFormAccessByToken(accessToken);
      if (!access) {
        return { success: false, error: "Invalid access token" };
      }

      if (access.status === "SUBMITTED") {
        return { success: false, error: "Form already submitted" };
      }

      if (!access.admissionForm.isPublished) {
        return { success: false, error: "Form is not available" };
      }

      // Create form submission
      const submission = await prisma.formSubmission.create({
        data: {
          formId: access.admissionFormId,
          leadId: access.leadId,
          data: validatedData.formData as any,
          metadata: {
            ...validatedData.metadata,
            accessToken,
            submittedVia: "student_portal",
            submissionTime: new Date(),
          },
          status: "submitted",
        },
      });

      // Update access status
      await prisma.studentFormAccess.update({
        where: { accessToken },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
          lastAccessedAt: new Date(),
        },
      });

      return { success: true, submissionId: submission.id };
    } catch (error) {
      console.error("Error submitting form:", error);
      return { success: false, error: "Failed to submit form" };
    }
  }

  /**
   * Get form access by lead ID
   */
  static async getFormAccessByLeadId(
    leadId: string
  ): Promise<FormAccessWithDetails | null> {
    const access = await prisma.studentFormAccess.findUnique({
      where: { leadId },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        admissionForm: {
          select: {
            id: true,
            title: true,
            description: true,
            isPublished: true,
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return access as FormAccessWithDetails;
  }

  /**
   * Get all form accesses for a tenant
   */
  static async getFormAccessesByTenant(
    tenantId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    } = {}
  ): Promise<{
    accesses: FormAccessWithDetails[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, status, search } = options;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { lead: { name: { contains: search, mode: "insensitive" } } },
        { admissionForm: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [accesses, total] = await Promise.all([
      prisma.studentFormAccess.findMany({
        where,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          admissionForm: {
            select: {
              id: true,
              title: true,
              description: true,
              isPublished: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.studentFormAccess.count({ where }),
    ]);

    return {
      accesses: accesses as FormAccessWithDetails[],
      total,
      page,
      limit,
    };
  }

  /**
   * Delete form access
   */
  static async deleteFormAccess(accessToken: string): Promise<boolean> {
    try {
      await prisma.studentFormAccess.delete({
        where: { accessToken },
      });
      return true;
    } catch (error) {
      console.error("Error deleting form access:", error);
      return false;
    }
  }

  /**
   * Generate secure access token
   */
  private static generateAccessToken(): string {
    return randomBytes(32).toString("hex");
  }

  /**
   * Validate access token format
   */
  static isValidAccessToken(token: string): boolean {
    return /^[a-f0-9]{64}$/.test(token);
  }

  /**
   * Get form access statistics
   */
  static async getFormAccessStats(tenantId: string): Promise<{
    total: number;
    notStarted: number;
    inProgress: number;
    submitted: number;
    completionRate: number;
  }> {
    const [total, notStarted, inProgress, submitted] = await Promise.all([
      prisma.studentFormAccess.count({ where: { tenantId } }),
      prisma.studentFormAccess.count({
        where: { tenantId, status: "NOT_STARTED" },
      }),
      prisma.studentFormAccess.count({
        where: { tenantId, status: "IN_PROGRESS" },
      }),
      prisma.studentFormAccess.count({
        where: { tenantId, status: "SUBMITTED" },
      }),
    ]);

    const completionRate = total > 0 ? (submitted / total) * 100 : 0;

    return {
      total,
      notStarted,
      inProgress,
      submitted,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }
}
