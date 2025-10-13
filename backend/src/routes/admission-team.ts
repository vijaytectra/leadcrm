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
const createAdmissionReviewSchema = z.object({
  applicationId: z.string().min(1),
  interviewNotes: z.string().optional(),
  academicScore: z.number().min(0).max(100).optional(),
  recommendations: z.string().optional(),
  decision: z.enum(["APPROVED", "REJECTED", "WAITLISTED"]).optional(),
  decisionReason: z.string().optional(),
});

const updateAdmissionReviewSchema = z.object({
  status: z
    .enum(["PENDING", "IN_REVIEW", "COMPLETED", "APPROVED", "REJECTED"])
    .optional(),
  interviewNotes: z.string().optional(),
  academicScore: z.number().min(0).max(100).optional(),
  recommendations: z.string().optional(),
  decision: z.enum(["APPROVED", "REJECTED", "WAITLISTED"]).optional(),
  decisionReason: z.string().optional(),
});

const createAppointmentSchema = z.object({
  applicationId: z.string().min(1),
  studentName: z.string().min(1),
  studentEmail: z.string().email().optional(),
  studentPhone: z.string().optional(),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(120).default(30),
  notes: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  duration: z.number().min(15).max(120).optional(),
  status: z
    .enum(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .optional(),
  notes: z.string().optional(),
});

const bulkCommunicationSchema = z.object({
  applicationIds: z.array(z.string()).min(1),
  type: z.enum(["EMAIL", "SMS", "WHATSAPP"]),
  subject: z.string().optional(),
  message: z.string().min(1),
  templateId: z.string().optional(),
});

// GET /api/:tenantSlug/admission-team/dashboard
router.get(
  "/:tenantSlug/admission-team/dashboard",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Get dashboard statistics
      const [
        totalApplications,
        pendingReviews,
        completedReviews,
        todayAppointments,
        recentReviews,
      ] = await Promise.all([
        prisma.application.count({
          where: { tenantId: tenant.id },
        }),
        prisma.admissionReview.count({
          where: {
            tenantId: tenant.id,
            status: { in: ["PENDING", "IN_REVIEW"] },
          },
        }),
        prisma.admissionReview.count({
          where: {
            tenantId: tenant.id,
            status: "COMPLETED",
          },
        }),
        prisma.appointment.count({
          where: {
            tenantId: tenant.id,
            scheduledAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        }),
        prisma.admissionReview.findMany({
          where: { tenantId: tenant.id },
          take: 5,
          orderBy: { updatedAt: "desc" },
          include: {
            application: {
              select: {
                id: true,
                studentName: true,
                studentEmail: true,
                course: true,
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
        }),
      ]);

      res.json({
        stats: {
          totalApplications,
          pendingReviews,
          completedReviews,
          todayAppointments,
        },
        recentReviews,
      });
    } catch (error) {
      console.error("Error fetching admission team dashboard:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/:tenantSlug/admission-team/applications
router.get(
  "/:tenantSlug/admission-team/applications",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const { status, course, page = "1", limit = "10" } = req.query;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const where: any = { tenantId: tenant.id };

      if (status) {
        where.status = status;
      }

      if (course) {
        where.course = { contains: course as string, mode: "insensitive" };
      }

      const applications = await prisma.application.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { submittedAt: "desc" },
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
          documents: {
            select: {
              id: true,
              fileName: true,
              status: true,
              createdAt: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      const total = await prisma.application.count({ where });

      res.json({
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/:tenantSlug/admission-team/applications/:id
router.get(
  "/:tenantSlug/admission-team/applications/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug, id } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const application = await prisma.application.findFirst({
        where: {
          id,
          tenantId: tenant.id,
        },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              source: true,
              notes: {
                orderBy: { createdAt: "desc" },
                take: 5,
              },
            },
          },
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
          documents: {
            include: {
              verifier: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          payments: true,
          appointments: {
            include: {
              assignee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
            orderBy: { scheduledAt: "desc" },
          },
        },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      res.json(application);
    } catch (error) {
      console.error("Error fetching application details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/:tenantSlug/admission-team/applications/:id/review
router.post(
  "/:tenantSlug/admission-team/applications/:id/review",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug, id } = req.params;
      const body = createAdmissionReviewSchema.parse(req.body);

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Check if application exists
      const application = await prisma.application.findFirst({
        where: {
          id,
          tenantId: tenant.id,
        },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Create or update admission review
      const admissionReview = await prisma.admissionReview.upsert({
        where: { applicationId: id },
        update: {
          ...body,
          reviewerId: req.user!.id,
          reviewedAt: new Date(),
          status: "COMPLETED",
        },
        create: {
          tenantId: tenant.id,
          applicationId: id,
          reviewerId: req.user!.id,
          ...body,
          reviewedAt: new Date(),
          status: "COMPLETED",
        },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.json(admissionReview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating admission review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/:tenantSlug/admission-team/communications/:applicationId
router.get(
  "/:tenantSlug/admission-team/communications/:applicationId",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug, applicationId } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const communications = await prisma.communication.findMany({
        where: {
          tenantId: tenant.id,
          applicationId,
        },
        orderBy: { createdAt: "desc" },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.json(communications);
    } catch (error) {
      console.error("Error fetching communications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/:tenantSlug/admission-team/communications/bulk
router.post(
  "/:tenantSlug/admission-team/communications/bulk",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const body = bulkCommunicationSchema.parse(req.body);

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Get applications
      const applications = await prisma.application.findMany({
        where: {
          id: { in: body.applicationIds },
          tenantId: tenant.id,
        },
        select: {
          id: true,
          studentName: true,
          studentEmail: true,
          studentPhone: true,
        },
      });

      if (applications.length !== body.applicationIds.length) {
        return res.status(400).json({ error: "Some applications not found" });
      }

      // Create communications for each application
      const communications = await Promise.all(
        applications.map((app) =>
          prisma.communication.create({
            data: {
              tenantId: tenant.id,
              applicationId: app.id,
              type: body.type,
              subject: body.subject,
              content: body.message,
              senderId: req.user!.id,
              status: "PENDING",
            },
          })
        )
      );

      res.json({
        message: `Bulk communication created for ${communications.length} applications`,
        communications,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating bulk communication:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/:tenantSlug/admission-team/appointments
router.get(
  "/:tenantSlug/admission-team/appointments",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const { date, status } = req.query;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const where: any = { tenantId: tenant.id };

      if (date) {
        const startDate = new Date(date as string);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        where.scheduledAt = {
          gte: startDate,
          lt: endDate,
        };
      }

      if (status) {
        where.status = status;
      }

      const appointments = await prisma.appointment.findMany({
        where,
        orderBy: { scheduledAt: "asc" },
        include: {
          application: {
            select: {
              id: true,
              studentName: true,
              studentEmail: true,
              course: true,
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/:tenantSlug/admission-team/appointments
router.post(
  "/:tenantSlug/admission-team/appointments",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const body = createAppointmentSchema.parse(req.body);

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const appointment = await prisma.appointment.create({
        data: {
          tenantId: tenant.id,
          applicationId: body.applicationId,
          assigneeId: req.user!.id,
          studentName: body.studentName,
          studentEmail: body.studentEmail,
          studentPhone: body.studentPhone,
          scheduledAt: new Date(body.scheduledAt),
          duration: body.duration,
          notes: body.notes,
        },
        include: {
          application: {
            select: {
              id: true,
              studentName: true,
              course: true,
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PUT /api/:tenantSlug/admission-team/appointments/:id
router.put(
  "/:tenantSlug/admission-team/appointments/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["ADMISSION_TEAM"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug, id } = req.params;
      const body = updateAppointmentSchema.parse(req.body);

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      const appointment = await prisma.appointment.findFirst({
        where: {
          id,
          tenantId: tenant.id,
          assigneeId: req.auth!.sub, // Only the assignee can update
        },
      });

      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      const updateData: any = { ...body };
      if (body.scheduledAt) {
        updateData.scheduledAt = new Date(body.scheduledAt);
      }

      const updatedAppointment = await prisma.appointment.update({
        where: { id },
        data: updateData,
        include: {
          application: {
            select: {
              id: true,
              studentName: true,
              course: true,
            },
          },
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
      }
      console.error("Error updating appointment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
