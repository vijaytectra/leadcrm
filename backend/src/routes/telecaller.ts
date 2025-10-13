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
const createCallLogSchema = z.object({
  leadId: z.string().min(1),
  callType: z.enum(["INBOUND", "OUTBOUND", "FOLLOW_UP", "SCHEDULED"]),
  status: z.enum([
    "INITIATED",
    "RINGING",
    "ANSWERED",
    "BUSY",
    "NO_ANSWER",
    "FAILED",
    "COMPLETED",
    "CANCELLED",
  ]),
  duration: z.number().optional(),
  outcome: z
    .enum([
      "SUCCESSFUL",
      "NO_ANSWER",
      "BUSY",
      "WRONG_NUMBER",
      "NOT_INTERESTED",
      "CALLBACK_REQUESTED",
      "INTERESTED",
      "QUALIFIED",
      "NOT_QUALIFIED",
      "FOLLOW_UP_SCHEDULED",
    ])
    .optional(),
  notes: z.string().optional(),
  recordingUrl: z.string().optional(),
  recordingId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
});

const updateCallLogSchema = z.object({
  status: z
    .enum([
      "INITIATED",
      "RINGING",
      "ANSWERED",
      "BUSY",
      "NO_ANSWER",
      "FAILED",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),
  duration: z.number().optional(),
  outcome: z
    .enum([
      "SUCCESSFUL",
      "NO_ANSWER",
      "BUSY",
      "WRONG_NUMBER",
      "NOT_INTERESTED",
      "CALLBACK_REQUESTED",
      "INTERESTED",
      "QUALIFIED",
      "NOT_QUALIFIED",
      "FOLLOW_UP_SCHEDULED",
    ])
    .optional(),
  notes: z.string().optional(),
  recordingUrl: z.string().optional(),
  recordingId: z.string().optional(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
});

const createFollowUpSchema = z.object({
  leadId: z.string().min(1),
  type: z.enum(["CALL", "EMAIL", "SMS", "WHATSAPP", "MEETING"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
});

const updateFollowUpSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED", "OVERDUE"]).optional(),
  notes: z.string().optional(),
  completedAt: z.string().datetime().optional(),
});

const updateLeadStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "INTERESTED",
    "APPLICATION_STARTED",
    "DOCUMENTS_SUBMITTED",
    "UNDER_REVIEW",
    "ADMITTED",
    "ENROLLED",
    "REJECTED",
    "LOST",
  ]),
  notes: z.string().optional(),
});

/**
 * GET /api/:tenant/telecaller/dashboard
 * Get telecaller dashboard data
 */
router.get(
  "/:tenant/telecaller/dashboard",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const userId = req.auth!.sub;
   

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });


      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      // Get assigned leads count by status
      const assignedLeads = await prisma.lead.findMany({
        where: {
          tenantId: tenant.id,
          assigneeId: userId,
        },
        select: {
          status: true,
          id: true,
        },
      });

      const leadsByStatus = assignedLeads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get today's call logs
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayCallLogs = await prisma.callLog.findMany({
        where: {
          tenantId: tenant.id,
          telecallerId: userId,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        select: {
          id: true,
          status: true,
          outcome: true,
          duration: true,
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Get pending follow-ups
      const pendingFollowUps = await prisma.followUpReminder.findMany({
        where: {
          tenantId: tenant.id,
          telecallerId: userId,
          status: "PENDING",
          scheduledAt: {
            lte: new Date(),
          },
        },
        select: {
          id: true,
          type: true,
          priority: true,
          scheduledAt: true,
          notes: true,
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              status: true,
            },
          },
        },
        orderBy: { scheduledAt: "asc" },
        take: 10,
      });

      // Get performance metrics for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const performanceData = await prisma.telecallerPerformance.findMany({
        where: {
          tenantId: tenant.id,
          telecallerId: userId,
          date: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          date: true,
          callsMade: true,
          callsAnswered: true,
          callsConverted: true,
          conversionRate: true,
          responseRate: true,
        },
        orderBy: { date: "asc" },
      });

      // Calculate today's stats
      const todayStats = {
        callsMade: todayCallLogs.length,
        callsAnswered: todayCallLogs.filter((log) => log.status === "COMPLETED")
          .length,
        callsConverted: todayCallLogs.filter(
          (log) => log.outcome === "QUALIFIED" || log.outcome === "INTERESTED"
        ).length,
        totalDuration: todayCallLogs.reduce(
          (sum, log) => sum + (log.duration || 0),
          0
        ),
      };

      res.json({
        success: true,
        data: {
          leadsByStatus,
          todayStats,
          recentCalls: todayCallLogs.slice(0, 5),
          pendingFollowUps,
          performanceData,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch dashboard data",
        code: "DASHBOARD_ERROR",
      });
    }
  }
);

/**
 * GET /api/:tenant/telecaller/leads
 * Get assigned leads for telecaller
 */
router.get(
  "/:tenant/telecaller/leads",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const userId = req.auth!.sub;
      const { status, page = "1", limit = "20" } = req.query;

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {
        tenantId: tenant.id,
        assigneeId: userId,
      };

      if (status) {
        where.status = status;
      }

      // Get leads with pagination
      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            source: true,
            status: true,
            score: true,
            createdAt: true,
            updatedAt: true,
            notes: {
              select: {
                id: true,
                note: true,
                createdAt: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
              take: 3,
            },
            callLogs: {
              select: {
                id: true,
                callType: true,
                status: true,
                outcome: true,
                duration: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
              take: 3,
            },
            followUpReminders: {
              where: {
                status: "PENDING",
              },
              select: {
                id: true,
                type: true,
                priority: true,
                scheduledAt: true,
              },
              orderBy: { scheduledAt: "asc" },
            },
          },
          orderBy: { updatedAt: "desc" },
          skip,
          take: limitNum,
        }),
        prisma.lead.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          leads,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch leads",
        code: "LEADS_ERROR",
      });
    }
  }
);

/**
 * GET /api/:tenant/telecaller/call-logs
 * Get call logs for telecaller
 */
router.get(
  "/:tenant/telecaller/call-logs",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const userId = req.auth!.sub;
      const {
        page = "1",
        limit = "20",
        status,
        outcome,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {
        tenantId: tenant.id,
        telecallerId: userId,
      };

      if (status) {
        where.status = status;
      }
      if (outcome) {
        where.outcome = outcome;
      }
      if (search) {
        where.OR = [
          { notes: { contains: search as string, mode: "insensitive" } },
          {
            lead: { name: { contains: search as string, mode: "insensitive" } },
          },
          {
            lead: {
              phone: { contains: search as string, mode: "insensitive" },
            },
          },
        ];
      }

      // Build order by clause
      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder === "desc" ? "desc" : "asc";

      // Get call logs with pagination
      const [callLogs, total] = await Promise.all([
        prisma.callLog.findMany({
          where,
          select: {
            id: true,
            callType: true,
            status: true,
            outcome: true,
            duration: true,
            notes: true,
            recordingUrl: true,
            recordingId: true,
            scheduledAt: true,
            startedAt: true,
            endedAt: true,
            createdAt: true,
            updatedAt: true,
            lead: {
              select: {
                id: true,
                name: true,
                phone: true,
                status: true,
              },
            },
          },
          orderBy,
          skip,
          take: limitNum,
        }),
        prisma.callLog.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          callLogs,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch call logs",
        code: "CALL_LOGS_ERROR",
      });
    }
  }
);

/**
 * POST /api/:tenant/telecaller/call-logs
 * Create a new call log
 */
router.post(
  "/:tenant/telecaller/call-logs",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const userId = req.auth!.sub;

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const validation = createCallLogSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const data = validation.data;

      // Verify lead exists and is assigned to this telecaller
      const lead = await prisma.lead.findFirst({
        where: {
          id: data.leadId,
          tenantId: tenant.id,
          assigneeId: userId,
        },
      });

      if (!lead) {
        return res.status(404).json({
          error: "Lead not found or not assigned to you",
          code: "LEAD_NOT_FOUND",
        });
      }

      // Create call log
      const callLog = await prisma.callLog.create({
        data: {
          tenantId: tenant.id,
          leadId: data.leadId,
          telecallerId: userId,
          callType: data.callType,
          status: data.status,
          duration: data.duration,
          outcome: data.outcome,
          notes: data.notes,
          recordingUrl: data.recordingUrl,
          recordingId: data.recordingId,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          startedAt: data.startedAt ? new Date(data.startedAt) : null,
          endedAt: data.endedAt ? new Date(data.endedAt) : null,
        },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              status: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: callLog,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to create call log",
        code: "CALL_LOG_ERROR",
      });
    }
  }
);

/**
 * PUT /api/:tenant/telecaller/call-logs/:id
 * Update a call log
 */
router.put(
  "/:tenant/telecaller/call-logs/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const callLogId = req.params.id;
      const userId = req.auth!.sub;

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const validation = updateCallLogSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const data = validation.data;

      // Verify call log exists and belongs to this telecaller
      const existingCallLog = await prisma.callLog.findFirst({
        where: {
          id: callLogId,
          tenantId: tenant.id,
          telecallerId: userId,
        },
      });

      if (!existingCallLog) {
        return res.status(404).json({
          error: "Call log not found",
          code: "CALL_LOG_NOT_FOUND",
        });
      }

      // Update call log
      const updateData: any = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.outcome !== undefined) updateData.outcome = data.outcome;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.recordingUrl !== undefined)
        updateData.recordingUrl = data.recordingUrl;
      if (data.recordingId !== undefined)
        updateData.recordingId = data.recordingId;
      if (data.startedAt !== undefined)
        updateData.startedAt = new Date(data.startedAt);
      if (data.endedAt !== undefined)
        updateData.endedAt = new Date(data.endedAt);

      const callLog = await prisma.callLog.update({
        where: { id: callLogId },
        data: updateData,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              status: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: callLog,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to update call log",
        code: "CALL_LOG_UPDATE_ERROR",
      });
    }
  }
);

/**
 * GET /api/:tenant/telecaller/follow-ups
 * Get follow-up reminders for telecaller
 */
router.get(
  "/:tenant/telecaller/follow-ups",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const userId = req.auth!.sub;
      const {
        page = "1",
        limit = "20",
        status,
        priority,
        type,
        search,
        sortBy = "scheduledAt",
        sortOrder = "asc",
      } = req.query;

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {
        tenantId: tenant.id,
        telecallerId: userId,
      };

      if (status) {
        where.status = status;
      }
      if (priority) {
        where.priority = priority;
      }
      if (type) {
        where.type = type;
      }
      if (search) {
        where.OR = [
          { notes: { contains: search as string, mode: "insensitive" } },
          {
            lead: { name: { contains: search as string, mode: "insensitive" } },
          },
          {
            lead: {
              phone: { contains: search as string, mode: "insensitive" },
            },
          },
        ];
      }

      // Build order by clause
      const orderBy: any = {};
      orderBy[sortBy as string] = sortOrder === "desc" ? "desc" : "asc";

      // Get follow-up reminders with pagination
      const [reminders, total] = await Promise.all([
        prisma.followUpReminder.findMany({
          where,
          select: {
            id: true,
            type: true,
            priority: true,
            status: true,
            scheduledAt: true,
            notes: true,
            completedAt: true,
            createdAt: true,
            updatedAt: true,
            lead: {
              select: {
                id: true,
                name: true,
                phone: true,
                status: true,
              },
            },
          },
          orderBy,
          skip,
          take: limitNum,
        }),
        prisma.followUpReminder.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          reminders,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      console.error("Get follow-up reminders error:", error);
      res.status(500).json({
        error: "Failed to fetch follow-up reminders",
        code: "FOLLOW_UPS_ERROR",
      });
    }
  }
);

/**
 * POST /api/:tenant/telecaller/follow-ups
 * Create a follow-up reminder
 */
router.post(
  "/:tenant/telecaller/follow-ups",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const userId = req.auth!.sub;

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const validation = createFollowUpSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const data = validation.data;

      // Verify lead exists and is assigned to this telecaller
      const lead = await prisma.lead.findFirst({
        where: {
          id: data.leadId,
          tenantId: tenant.id,
          assigneeId: userId,
        },
      });

      if (!lead) {
        return res.status(404).json({
          error: "Lead not found or not assigned to you",
          code: "LEAD_NOT_FOUND",
        });
      }

      // Create follow-up reminder
      const followUp = await prisma.followUpReminder.create({
        data: {
          tenantId: tenant.id,
          leadId: data.leadId,
          telecallerId: userId,
          type: data.type,
          priority: data.priority,
          scheduledAt: new Date(data.scheduledAt),
          notes: data.notes,
        },
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              status: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        data: followUp,
      });
    } catch (error) {
      console.error("Create follow-up error:", error);
      res.status(500).json({
        error: "Failed to create follow-up",
        code: "FOLLOW_UP_ERROR",
      });
    }
  }
);

/**
 * PUT /api/:tenant/telecaller/follow-ups/:id
 * Update a follow-up reminder
 */
router.put(
  "/:tenant/telecaller/follow-ups/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const followUpId = req.params.id;
      const userId = req.auth!.sub;

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const validation = updateFollowUpSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const data = validation.data;

      // Verify follow-up exists and belongs to this telecaller
      const existingFollowUp = await prisma.followUpReminder.findFirst({
        where: {
          id: followUpId,
          tenantId: tenant.id,
          telecallerId: userId,
        },
      });

      if (!existingFollowUp) {
        return res.status(404).json({
          error: "Follow-up not found",
          code: "FOLLOW_UP_NOT_FOUND",
        });
      }

      // Update follow-up
      const updateData: any = {};
      if (data.status !== undefined) updateData.status = data.status;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.completedAt !== undefined)
        updateData.completedAt = new Date(data.completedAt);

      const followUp = await prisma.followUpReminder.update({
        where: { id: followUpId },
        data: updateData,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              status: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: followUp,
      });
    } catch (error) {
      console.error("Update follow-up error:", error);
      res.status(500).json({
        error: "Failed to update follow-up",
        code: "FOLLOW_UP_UPDATE_ERROR",
      });
    }
  }
);

/**
 * PUT /api/:tenant/telecaller/leads/:id/status
 * Update lead status
 */
router.put(
  "/:tenant/telecaller/leads/:id/status",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const leadId = req.params.id;
      const userId = req.auth!.sub;

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const validation = updateLeadStatusSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const { status, notes } = validation.data;

      // Verify lead exists and is assigned to this telecaller
      const lead = await prisma.lead.findFirst({
        where: {
          id: leadId,
          tenantId: tenant.id,
          assigneeId: userId,
        },
      });

      if (!lead) {
        return res.status(404).json({
          error: "Lead not found or not assigned to you",
          code: "LEAD_NOT_FOUND",
        });
      }

      // Update lead status
      const updatedLead = await prisma.lead.update({
        where: { id: leadId },
        data: {
          status,
          updatedAt: new Date(),
        },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Add note if provided
      if (notes) {
        await prisma.leadNote.create({
          data: {
            leadId,
            userId,
            note: `Status updated to ${status}: ${notes}`,
          },
        });
      }

      res.json({
        success: true,
        data: updatedLead,
      });
    } catch (error) {
      console.error("Update lead status error:", error);
      res.status(500).json({
        error: "Failed to update lead status",
        code: "LEAD_STATUS_UPDATE_ERROR",
      });
    }
  }
);

/**
 * GET /api/:tenant/telecaller/performance
 * Get telecaller performance metrics
 */
router.get(
  "/:tenant/telecaller/performance",
  requireAuth,
  requireActiveUser,
  requireRole(["TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      const userId = req.auth!.sub;
      const { period = "7d" } = req.query;

      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenant) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case "1d":
          startDate.setDate(endDate.getDate() - 1);
          break;
        case "7d":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(endDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Get performance data
      const performanceData = await prisma.telecallerPerformance.findMany({
        where: {
          tenantId: tenant.id,
          telecallerId: userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "asc" },
      });

      // Get call logs for detailed metrics
      const callLogs = await prisma.callLog.findMany({
        where: {
          tenantId: tenant.id,
          telecallerId: userId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          status: true,
          outcome: true,
          duration: true,
          createdAt: true,
        },
      });

      // Calculate aggregated metrics
      const totalCalls = callLogs.length;
      const answeredCalls = callLogs.filter(
        (log) => log.status === "COMPLETED"
      ).length;
      const convertedCalls = callLogs.filter(
        (log) => log.outcome === "QUALIFIED" || log.outcome === "INTERESTED"
      ).length;
      const totalDuration = callLogs.reduce(
        (sum, log) => sum + (log.duration || 0),
        0
      );
      const avgCallDuration =
        answeredCalls > 0 ? totalDuration / answeredCalls : 0;
      const conversionRate =
        answeredCalls > 0 ? (convertedCalls / answeredCalls) * 100 : 0;
      const responseRate =
        totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;

      res.json({
        success: true,
        data: {
          period,
          metrics: {
            totalCalls,
            answeredCalls,
            convertedCalls,
            totalDuration,
            avgCallDuration,
            conversionRate,
            responseRate,
          },
          performanceData,
          callLogs: callLogs.slice(0, 50), // Last 50 calls for details
        },
      });
    } catch (error) {
      console.error("Telecaller performance error:", error);
      res.status(500).json({
        error: "Failed to fetch performance data",
        code: "PERFORMANCE_ERROR",
      });
    }
  }
);

export default router;
