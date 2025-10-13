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
const uploadDocumentSchema = z.object({
  applicationId: z.string().min(1),
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().min(1),
  filePath: z.string().min(1),
});

const createRefundRequestSchema = z.object({
  applicationId: z.string().min(1),
  paymentId: z.string().optional(),
  amount: z.number().min(0),
  reason: z.string().min(1),
  description: z.string().optional(),
});

// GET /api/:tenantSlug/student/application/:id
router.get(
  "/:tenantSlug/student/application/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["STUDENT", "PARENT"]),
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
          offerLetter: {
            include: {
              template: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          documents: {
            select: {
              id: true,
              fileName: true,
              fileType: true,
              fileSize: true,
              status: true,
              createdAt: true,
              rejectionReason: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
              gatewayTransactionId: true,
            },
          },
          appointments: {
            select: {
              id: true,
              scheduledAt: true,
              duration: true,
              status: true,
              notes: true,
            },
            orderBy: { scheduledAt: "desc" },
          },
        },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Calculate progress
      const progressSteps = [
        {
          name: "Application Submitted",
          completed: true,
          date: application.submittedAt,
        },
        {
          name: "Documents Uploaded",
          completed: application.documents.length > 0,
          date: application.documents[0]?.createdAt,
        },
        {
          name: "Documents Verified",
          completed: application.documents.every(
            (doc) => doc.status === "VERIFIED"
          ),
          date: null,
        },
        {
          name: "Payment Completed",
          completed: application.payments.some((p) => p.status === "COMPLETED"),
          date: application.payments.find((p) => p.status === "COMPLETED")
            ?.createdAt,
        },
        {
          name: "Under Review",
          completed: application.status === "UNDER_REVIEW",
          date:
            application.status === "UNDER_REVIEW"
              ? application.updatedAt
              : null,
        },
        {
          name: "Admission Decision",
          completed:
            application.status === "ADMITTED" ||
            application.status === "REJECTED",
          date:
            application.status === "ADMITTED" ||
            application.status === "REJECTED"
              ? application.updatedAt
              : null,
        },
        {
          name: "Offer Letter",
          completed: !!application.offerLetter,
          date: application.offerLetter?.createdAt,
        },
        {
          name: "Enrolled",
          completed: application.status === "ENROLLED",
          date:
            application.status === "ENROLLED" ? application.updatedAt : null,
        },
      ];

      res.json({
        ...application,
        progressSteps,
      });
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/:tenantSlug/student/documents/:applicationId
router.get(
  "/:tenantSlug/student/documents/:applicationId",
  requireAuth,
  requireActiveUser,
  requireRole(["STUDENT", "PARENT"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug, applicationId } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Verify application belongs to tenant
      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          tenantId: tenant.id,
        },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const documents = await prisma.document.findMany({
        where: {
          applicationId,
          tenantId: tenant.id,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fileName: true,
          fileType: true,
          fileSize: true,
          status: true,
          createdAt: true,
          verifiedAt: true,
          rejectedAt: true,
          rejectionReason: true,
          verifier: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/:tenantSlug/student/documents
router.post(
  "/:tenantSlug/student/documents",
  requireAuth,
  requireActiveUser,
  requireRole(["STUDENT", "PARENT"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const body = uploadDocumentSchema.parse(req.body);

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Verify application belongs to tenant
      const application = await prisma.application.findFirst({
        where: {
          id: body.applicationId,
          tenantId: tenant.id,
        },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const document = await prisma.document.create({
        data: {
          tenantId: tenant.id,
          applicationId: body.applicationId,
          fileName: body.fileName,
          filePath: body.filePath,
          fileType: body.fileType,
          fileSize: body.fileSize,
          status: "UPLOADED",
        },
      });

      res.json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
      }
      console.error("Error uploading document:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/:tenantSlug/student/payments/:applicationId
router.get(
  "/:tenantSlug/student/payments/:applicationId",
  requireAuth,
  requireActiveUser,
  requireRole(["STUDENT", "PARENT"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug, applicationId } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Verify application belongs to tenant
      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          tenantId: tenant.id,
        },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const payments = await prisma.payment.findMany({
        where: {
          applicationId,
          tenantId: tenant.id,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          amount: true,
          platformFee: true,
          institutionAmount: true,
          status: true,
          gatewayTransactionId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Calculate totals
      const totalPaid = payments
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + p.amount, 0);

      const totalPending = payments
        .filter((p) => p.status === "PENDING")
        .reduce((sum, p) => sum + p.amount, 0);

      res.json({
        payments,
        summary: {
          totalPaid,
          totalPending,
          totalTransactions: payments.length,
        },
      });
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/:tenantSlug/student/communications/:applicationId
router.get(
  "/:tenantSlug/student/communications/:applicationId",
  requireAuth,
  requireActiveUser,
  requireRole(["STUDENT", "PARENT"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug, applicationId } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Verify application belongs to tenant
      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          tenantId: tenant.id,
        },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const communications = await prisma.communication.findMany({
        where: {
          applicationId,
          tenantId: tenant.id,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          subject: true,
          content: true,
          status: true,
          createdAt: true,
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      // Group by type for easier display
      const groupedCommunications = communications.reduce((acc, comm) => {
        if (!acc[comm.type]) {
          acc[comm.type] = [];
        }
        acc[comm.type].push(comm);
        return acc;
      }, {} as Record<string, typeof communications>);

      res.json({
        communications,
        groupedCommunications,
        totalCount: communications.length,
      });
    } catch (error) {
      console.error("Error fetching communications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/:tenantSlug/student/refund-request
router.post(
  "/:tenantSlug/student/refund-request",
  requireAuth,
  requireActiveUser,
  requireRole(["STUDENT", "PARENT"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug } = req.params;
      const body = createRefundRequestSchema.parse(req.body);

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Verify application belongs to tenant
      const application = await prisma.application.findFirst({
        where: {
          id: body.applicationId,
          tenantId: tenant.id,
        },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // If paymentId is provided, verify it belongs to the application
      if (body.paymentId) {
        const payment = await prisma.payment.findFirst({
          where: {
            id: body.paymentId,
            applicationId: body.applicationId,
            tenantId: tenant.id,
          },
        });

        if (!payment) {
          return res.status(404).json({ error: "Payment not found" });
        }
      }

      const refundRequest = await prisma.refundRequest.create({
        data: {
          tenantId: tenant.id,
          applicationId: body.applicationId,
          paymentId: body.paymentId,
          studentName: application.studentName,
          studentEmail: application.studentEmail,
          studentPhone: application.studentPhone,
          amount: body.amount,
          reason: body.reason,
          status: "PENDING",
          requestedAt: new Date(),
        },
      });

      res.json(refundRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
      }
      console.error("Error creating refund request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /api/:tenantSlug/student/offer-letter/:applicationId
router.get(
  "/:tenantSlug/student/offer-letter/:applicationId",
  requireAuth,
  requireActiveUser,
  requireRole(["STUDENT", "PARENT"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug, applicationId } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Verify application belongs to tenant
      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          tenantId: tenant.id,
        },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const offerLetter = await prisma.offerLetter.findUnique({
        where: { applicationId },
        include: {
          template: {
            select: {
              id: true,
              name: true,
            },
          },
          generator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!offerLetter) {
        return res.status(404).json({ error: "Offer letter not found" });
      }

      res.json(offerLetter);
    } catch (error) {
      console.error("Error fetching offer letter:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/:tenantSlug/student/offer-letter/:applicationId/accept
router.post(
  "/:tenantSlug/student/offer-letter/:applicationId/accept",
  requireAuth,
  requireActiveUser,
  requireRole(["STUDENT", "PARENT"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug, applicationId } = req.params;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Verify application belongs to tenant
      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          tenantId: tenant.id,
        },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const offerLetter = await prisma.offerLetter.findUnique({
        where: { applicationId },
      });

      if (!offerLetter) {
        return res.status(404).json({ error: "Offer letter not found" });
      }

      if (offerLetter.status === "ACCEPTED") {
        return res.status(400).json({ error: "Offer letter already accepted" });
      }

      if (offerLetter.status === "DECLINED") {
        return res
          .status(400)
          .json({ error: "Offer letter has been declined" });
      }

      // Update offer letter status
      const updatedOfferLetter = await prisma.offerLetter.update({
        where: { id: offerLetter.id },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
          viewedAt: new Date(),
        },
      });

      // Update application status to ENROLLED
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: "ENROLLED" },
      });

      res.json(updatedOfferLetter);
    } catch (error) {
      console.error("Error accepting offer letter:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /api/:tenantSlug/student/offer-letter/:applicationId/decline
router.post(
  "/:tenantSlug/student/offer-letter/:applicationId/decline",
  requireAuth,
  requireActiveUser,
  requireRole(["STUDENT", "PARENT"]),
  async (req: AuthedRequest, res) => {
    try {
      const { tenantSlug, applicationId } = req.params;
      const { reason } = req.body;

      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }

      // Verify application belongs to tenant
      const application = await prisma.application.findFirst({
        where: {
          id: applicationId,
          tenantId: tenant.id,
        },
      });

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const offerLetter = await prisma.offerLetter.findUnique({
        where: { applicationId },
      });

      if (!offerLetter) {
        return res.status(404).json({ error: "Offer letter not found" });
      }

      if (offerLetter.status === "DECLINED") {
        return res.status(400).json({ error: "Offer letter already declined" });
      }

      if (offerLetter.status === "ACCEPTED") {
        return res
          .status(400)
          .json({ error: "Offer letter has been accepted" });
      }

      // Update offer letter status
      const updatedOfferLetter = await prisma.offerLetter.update({
        where: { id: offerLetter.id },
        data: {
          status: "DECLINED",
          declinedAt: new Date(),
          viewedAt: new Date(),
        },
      });

      res.json(updatedOfferLetter);
    } catch (error) {
      console.error("Error declining offer letter:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
