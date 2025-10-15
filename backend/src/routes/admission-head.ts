import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  requireActiveUser,
  requireRole,
} from "../middleware/auth";
import type { AuthedRequest } from "../middleware/auth";

const router = Router();

// Validation schemas
const createOfferLetterTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  content: z.record(z.unknown()),
  variables: z.record(z.unknown()),
  isActive: z.boolean().default(true),
});

const updateOfferLetterTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.record(z.unknown()).optional(),
  variables: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

const generateOfferLetterSchema = z.object({
  applicationId: z.string().min(1),
  templateId: z.string().optional(),
  customContent: z.record(z.unknown()).optional(),
});

const bulkGenerateOffersSchema = z.object({
  applicationIds: z.array(z.string()).min(1),
  templateId: z.string().optional(),
});

const distributeOffersSchema = z.object({
  offerLetterIds: z.array(z.string()).min(1),
  channels: z.array(z.enum(["EMAIL", "SMS", "WHATSAPP"])).min(1),
  subject: z.string().optional(),
  message: z.string().optional(),
});

// GET /api/:tenantSlug/admission-head/dashboard
router.get(
  "/:tenantSlug/admission-head/dashboard",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_HEAD"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Get dashboard statistics
      const [
        totalApplications,
        pendingApprovals,
        approvedApplications,
        rejectedApplications,
        offerLettersGenerated,
        offerLettersSent,
        offerLettersAccepted,
        teamPerformance,
      ] = await Promise.all([
        prisma.application.count({
          where: { tenantId: tenant.id },
        }),
        prisma.admissionReview.count({
          where: {
            tenantId: tenant.id,
            status: "COMPLETED",
            decision: null,
          },
        }),
        prisma.admissionReview.count({
          where: {
            tenantId: tenant.id,
            decision: "APPROVED",
          },
        }),
        prisma.admissionReview.count({
          where: {
            tenantId: tenant.id,
            decision: "REJECTED",
          },
        }),
        prisma.offerLetter.count({
          where: { tenantId: tenant.id },
        }),
        prisma.offerLetter.count({
          where: {
            tenantId: tenant.id,
            status: { in: ["SENT", "VIEWED", "ACCEPTED", "DECLINED"] },
          },
        }),
        prisma.offerLetter.count({
          where: {
            tenantId: tenant.id,
            status: "ACCEPTED",
          },
        }),
        prisma.admissionReview.groupBy({
          by: ["reviewerId"],
          where: { tenantId: tenant.id },
          _count: { id: true },
          _avg: { academicScore: true },
          include: {
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
      ]);

      // Calculate conversion rates
      const conversionRate =
        totalApplications > 0
          ? (approvedApplications / totalApplications) * 100
          : 0;
      const offerAcceptanceRate =
        offerLettersSent > 0
          ? (offerLettersAccepted / offerLettersSent) * 100
          : 0;

      res.json({
        stats: {
          totalApplications,
          pendingApprovals,
          approvedApplications,
          rejectedApplications,
          offerLettersGenerated,
          offerLettersSent,
          offerLettersAccepted,
          conversionRate: Math.round(conversionRate * 100) / 100,
          offerAcceptanceRate: Math.round(offerAcceptanceRate * 100) / 100,
        },
        teamPerformance,
      });
    } catch (error) {
      console.error("Error fetching admission head dashboard:", error);
      res.status(500).json({ 
        message: "Internal server error",
        code: "INTERNAL_ERROR",
       });
    }
  }
);

// GET /api/:tenantSlug/admission-head/reports
router.get(
  "/:tenantSlug/admission-head/reports",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_HEAD"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const { period = "30d", type = "summary" } = req.query;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      if (type === "summary") {
        // Generate summary report
        const [
          applicationsByStatus,
          applicationsByCourse,
          applicationsByMonth,
          teamPerformance,
          conversionFunnel,
        ] = await Promise.all([
          prisma.application.groupBy({
            by: ["status"],
            where: {
              tenantId: tenant.id,
              submittedAt: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
          }),
          prisma.application.groupBy({
            by: ["course"],
            where: {
              tenantId: tenant.id,
              submittedAt: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
          }),
          prisma.$queryRaw`
          SELECT 
            strftime('%Y-%m', submittedAt) as month,
            COUNT(*) as count
          FROM Application 
          WHERE tenantId = ${tenant.id} 
            AND submittedAt >= ${startDate} 
            AND submittedAt <= ${endDate}
          GROUP BY strftime('%Y-%m', submittedAt)
          ORDER BY month
        `,
          prisma.admissionReview.groupBy({
            by: ["reviewerId"],
            where: {
              tenantId: tenant.id,
              createdAt: { gte: startDate, lte: endDate },
            },
            _count: { id: true },
            _avg: { academicScore: true },
          }),
          prisma.$queryRaw`
          SELECT 
            'SUBMITTED' as stage, COUNT(*) as count FROM Application WHERE tenantId = ${tenant.id} AND submittedAt >= ${startDate} AND submittedAt <= ${endDate}
          UNION ALL
          SELECT 
            'UNDER_REVIEW' as stage, COUNT(*) as count FROM Application WHERE tenantId = ${tenant.id} AND status = 'UNDER_REVIEW' AND submittedAt >= ${startDate} AND submittedAt <= ${endDate}
          UNION ALL
          SELECT 
            'ADMITTED' as stage, COUNT(*) as count FROM Application WHERE tenantId = ${tenant.id} AND status = 'ADMITTED' AND submittedAt >= ${startDate} AND submittedAt <= ${endDate}
          UNION ALL
          SELECT 
            'ENROLLED' as stage, COUNT(*) as count FROM Application WHERE tenantId = ${tenant.id} AND status = 'ENROLLED' AND submittedAt >= ${startDate} AND submittedAt <= ${endDate}
        `,
        ]);

        res.json({
          period,
          dateRange: { startDate, endDate },
          applicationsByStatus,
          applicationsByCourse,
          applicationsByMonth,
          teamPerformance,
          conversionFunnel,
        });
      } else {
        // Generate detailed report
        const applications = await prisma.application.findMany({
          where: {
            tenantId: tenant.id,
            submittedAt: { gte: startDate, lte: endDate },
          },
          include: {
            admissionReview: {
              include: {
                reviewer: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            offerLetter: true,
            payments: {
              select: {
                amount: true,
                status: true,
              },
            },
          },
          orderBy: { submittedAt: "desc" },
        });

        res.json({
          period,
          dateRange: { startDate, endDate },
          applications,
        });
      }
    } catch (error) {
      console.error("Error generating reports:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

// GET /api/:tenantSlug/admission-head/templates
router.get(
  "/:tenantSlug/admission-head/templates",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_HEAD"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const { active } = req.query;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      const where: any = { tenantId: tenant.id };
      if (active !== undefined) {
        where.isActive = active === "true";
      }

      const templates = await prisma.offerLetterTemplate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { offerLetters: true },
          },
        },
      });

      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/:tenantSlug/admission-head/templates
router.post(
  "/:tenantSlug/admission-head/templates",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_HEAD"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const body = createOfferLetterTemplateSchema.parse(req.body);

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const template = await prisma.offerLetterTemplate.create({
        data: {
          tenantId: tenant.id,
          createdBy: req.user!.id,
          ...body,
        },
      });

      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", details: error.errors });
      }
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

// PUT /api/:tenantSlug/admission-head/templates/:id
router.put(
  "/:tenantSlug/admission-head/templates/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_HEAD"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug, id } = req.params;
      const body = updateOfferLetterTemplateSchema.parse(req.body);

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const template = await prisma.offerLetterTemplate.findFirst({
        where: {
          id,
          tenantId: tenant.id,
        },
      });

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      const updatedTemplate = await prisma.offerLetterTemplate.update({
        where: { id },
        data: body,
      });

      res.json(updatedTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", details: error.errors });
      }
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

// DELETE /api/:tenantSlug/admission-head/templates/:id
router.delete(
  "/:tenantSlug/admission-head/templates/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_HEAD"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug, id } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      const template = await prisma.offerLetterTemplate.findFirst({
        where: {
          id,
          tenantId: tenant.id,
        },
      });

      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      await prisma.offerLetterTemplate.delete({
        where: { id },
      });

      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

// POST /api/:tenantSlug/admission-head/offers/generate
router.post(
  "/:tenantSlug/admission-head/offers/generate",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_HEAD"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const body = generateOfferLetterSchema.parse(req.body);

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      // Check if application exists and is approved
      const application = await prisma.application.findFirst({
        where: {
          id: body.applicationId,
          tenantId: tenant.id,
        },
        include: {
          admissionReview: true,
        },
      });

      if (!application) {
        return res.status(404).json({ message: "Application not found", code: "APPLICATION_NOT_FOUND" });
      }

      if (application.admissionReview?.decision !== "APPROVED") {
        return res.status(400).json({
          message: "Application must be approved before generating offer letter",
          code: "APPLICATION_NOT_APPROVED",
        });
      }

      // Check if offer letter already exists
      const existingOffer = await prisma.offerLetter.findUnique({
        where: { applicationId: body.applicationId },
      });

      if (existingOffer) {
        return res
          .status(400)
          .json({ message: "Offer letter already exists for this application", code: "OFFER_LETTER_ALREADY_EXISTS" });
      }

      let template = null;
      if (body.templateId) {
        template = await prisma.offerLetterTemplate.findFirst({
          where: {
            id: body.templateId,
            tenantId: tenant.id,
            isActive: true,
          },
        });

        if (!template) {
          return res.status(404).json({ message: "Template not found", code: "TEMPLATE_NOT_FOUND" });
        }
      }

      // Generate offer letter content
      const content = body.customContent ||
        template?.content || {
          studentName: application.studentName,
          course: application.course,
          institutionName: tenant.name,
          generatedDate: new Date().toISOString(),
        };

      const offerLetter = await prisma.offerLetter.create({
        data: {
          tenantId: tenant.id,
          applicationId: body.applicationId,
          templateId: body.templateId,
          content,
          generatedBy: req.user!.id,
          status: "DRAFT",
        },
        include: {
          application: {
            select: {
              id: true,
              studentName: true,
              studentEmail: true,
              course: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json(offerLetter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", details: error.errors });
      }
      console.error("Error generating offer letter:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

// POST /api/:tenantSlug/admission-head/offers/bulk-generate
router.post(
  "/:tenantSlug/admission-head/offers/bulk-generate",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_HEAD"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const body = bulkGenerateOffersSchema.parse(req.body);

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      // Get approved applications
      const applications = await prisma.application.findMany({
        where: {
          id: { in: body.applicationIds },
          tenantId: tenant.id,
          admissionReview: {
            decision: "APPROVED",
          },
        },
        include: {
          admissionReview: true,
        },
      });

      if (applications.length !== body.applicationIds.length) {
        return res
          .status(400)
          .json({ message: "Some applications are not approved or not found", code: "APPLICATIONS_NOT_APPROVED" });
      }

      // Check for existing offer letters
      const existingOffers = await prisma.offerLetter.findMany({
        where: {
          applicationId: { in: body.applicationIds },
        },
      });

      if (existingOffers.length > 0) {
        return res.status(400).json({
          message: "Some applications already have offer letters",
          code: "APPLICATIONS_ALREADY_HAVE_OFFER_LETTERS",
          existingApplications: existingOffers.map(
            (offer) => offer.applicationId
          ),
        });
      }

      let template = null;
      if (body.templateId) {
        template = await prisma.offerLetterTemplate.findFirst({
          where: {
            id: body.templateId,
            tenantId: tenant.id,
            isActive: true,
          },
        });

        if (!template) {
          return res.status(404).json({ message: "Template not found", code: "TEMPLATE_NOT_FOUND" });
        }
      }

      // Generate offer letters for all applications
      const offerLetters = await Promise.all(
        applications.map((app) =>
          prisma.offerLetter.create({
            data: {
              tenantId: tenant.id,
              applicationId: app.id,
              templateId: body.templateId,
              content: template?.content || {
                studentName: app.studentName,
                course: app.course,
                institutionName: tenant.name,
                generatedDate: new Date().toISOString(),
              },
              generatedBy: req.user!.id,
              status: "DRAFT",
            },
          })
        )
      );

      res.json({
        message: `Generated ${offerLetters.length} offer letters`,
        offerLetters,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", details: error.errors });
      }
      console.error("Error bulk generating offer letters:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

// POST /api/:tenantSlug/admission-head/offers/distribute
router.post(
  "/:tenantSlug/admission-head/offers/distribute",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_HEAD"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const body = distributeOffersSchema.parse(req.body);

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      // Get offer letters
      const offerLetters = await prisma.offerLetter.findMany({
        where: {
          id: { in: body.offerLetterIds },
          tenantId: tenant.id,
        },
        include: {
          application: {
            select: {
              id: true,
              studentName: true,
              studentEmail: true,
              studentPhone: true,
            },
          },
        },
      });

      if (offerLetters.length !== body.offerLetterIds.length) {
        return res.status(400).json({ message: "Some offer letters not found", code: "OFFER_LETTERS_NOT_FOUND" });
      }

      // Update offer letters status and create communications
      const results = await Promise.all(
        offerLetters.map(async (offer) => {
          // Update offer letter status
          const updatedOffer = await prisma.offerLetter.update({
            where: { id: offer.id },
            data: {
              status: "SENT",
              sentAt: new Date(),
            },
          });

          // Create communications for each channel
          const communications = await Promise.all(
            body.channels.map((channel) =>
              prisma.communication.create({
                data: {
                  tenantId: tenant.id,
                  applicationId: offer.applicationId,
                  type: channel,
                  subject: body.subject || "Offer Letter",
                  content:
                    body.message || "Your offer letter is ready for review.",
                  senderId: req.user!.id,
                  status: "SENT",
                },
              })
            )
          );

          return {
            offerLetter: updatedOffer,
            communications,
          };
        })
      );

      res.json({
        message: `Distributed ${results.length} offer letters`,
        results,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: "Validation error", details: error.errors });
      }
      console.error("Error distributing offer letters:", error);
      res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

// GET /api/:tenantSlug/admission-head/approvals
router.get(
  "/:tenantSlug/admission-head/approvals",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_HEAD"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const { status = "PENDING" } = req.query;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found", code: "TENANT_NOT_FOUND" });
      }

      const where: any = {
        tenantId: tenant.id,
        status: "COMPLETED",
      };

      if (status === "PENDING") {
        where.decision = null;
      } else if (status === "APPROVED") {
        where.decision = "APPROVED";
      } else if (status === "REJECTED") {
        where.decision = "REJECTED";
      }

      const approvals = await prisma.admissionReview.findMany({
        where,
        orderBy: { reviewedAt: "desc" },
        include: {
          application: {
            select: {
              id: true,
              studentName: true,
              studentEmail: true,
              course: true,
              status: true,
              submittedAt: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.json(approvals);
    } catch (error) {
      console.error("Error fetching approvals:", error);
        res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
    }
  }
);

export default router;
