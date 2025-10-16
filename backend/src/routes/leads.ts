import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  requireAuth,
  AuthedRequest,
  requireActiveUser,
  requireRole,
} from "../middleware/auth";
import { z } from "zod";
import multer from "multer";
import * as XLSX from "xlsx";
import { Readable } from "stream";
import { notificationService } from "../lib/notifications";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only CSV and Excel files are allowed."));
    }
  },
});

// Validation schemas
const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format").optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  source: z.string().optional(),
  status: z
    .enum([
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
    ])
    .optional()
    .default("NEW"),
  score: z.number().min(0).max(100).optional().default(0),
  assigneeId: z.string().optional(),
  notes: z.string().optional(),
});

const updateLeadSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  source: z.string().optional(),
  status: z
    .enum([
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
    ])
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  score: z.number().min(0).max(100).optional(),
  assigneeId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
});

const leadQuerySchema = z.object({
  page: z.string().transform(Number).optional().default(1),
  limit: z.string().transform(Number).optional().default(10),
  status: z.string().optional(),
  source: z.string().optional(),
  assigneeId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "name", "score"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const addNoteSchema = z.object({
  note: z.string().min(1, "Note is required"),
});

const bulkImportSchema = z.object({
  leads: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email format").optional(),
        phone: z
          .string()
          .min(10, "Phone number must be at least 10 digits")
          .optional(),
        source: z.string().optional(),
        score: z.number().min(0).max(100).optional().default(0),
      })
    )
    .min(1, "At least one lead is required"),
});

const reassignLeadSchema = z.object({
  assigneeId: z.string().min(1, "Assignee ID is required"),
  reason: z.string().optional(),
});

const assignmentConfigSchema = z.object({
  algorithm: z
    .enum(["ROUND_ROBIN", "LOAD_BASED", "SKILL_BASED"])
    .default("ROUND_ROBIN"),
  autoAssign: z.boolean().default(true),
  maxLeadsPerUser: z.number().min(1).default(50),
  skillRequirements: z.record(z.string(), z.array(z.string())).optional(),
});

// Assignment algorithms
interface AssignmentUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  currentLeadCount: number;
  skills?: string[];
}

interface LeadAssignment {
  leadId: string;
  assigneeId: string;
  algorithm: string;
  assignedAt: Date;
}

/**
 * Round-robin assignment algorithm
 */
async function roundRobinAssignment(
  tenantId: string,
  leadIds: string[]
): Promise<LeadAssignment[]> {
  const telecallers = await prisma.user.findMany({
    where: {
      tenantId,
      role: "TELECALLER",
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      _count: {
        select: {
          assignedLeads: {
            where: {
              status: {
                in: ["NEW", "CONTACTED", "QUALIFIED", "INTERESTED"],
              },
            },
          },
        },
      },
    },
  });

  if (telecallers.length === 0) {
    throw new Error("No active telecallers found");
  }

  const assignments: LeadAssignment[] = [];
  let currentIndex = 0;

  for (const leadId of leadIds) {
    const assignee = telecallers[currentIndex % telecallers.length];
    assignments.push({
      leadId,
      assigneeId: assignee.id,
      algorithm: "ROUND_ROBIN",
      assignedAt: new Date(),
    });
    currentIndex++;
  }

  return assignments;
}

/**
 * Load-based assignment algorithm
 */
async function loadBasedAssignment(
  tenantId: string,
  leadIds: string[]
): Promise<LeadAssignment[]> {
  const telecallers = await prisma.user.findMany({
    where: {
      tenantId,
      role: "TELECALLER",
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      _count: {
        select: {
          assignedLeads: {
            where: {
              status: {
                in: ["NEW", "CONTACTED", "QUALIFIED", "INTERESTED"],
              },
            },
          },
        },
      },
    },
  });

  if (telecallers.length === 0) {
    throw new Error("No active telecallers found");
  }

  const assignments: LeadAssignment[] = [];

  for (const leadId of leadIds) {
    // Find telecaller with minimum load
    const assignee = telecallers.reduce((min, current) =>
      current._count.assignedLeads < min._count.assignedLeads ? current : min
    );

    assignments.push({
      leadId,
      assigneeId: assignee.id,
      algorithm: "LOAD_BASED",
      assignedAt: new Date(),
    });

    // Update the count for next iteration
    assignee._count.assignedLeads++;
  }

  return assignments;
}

/**
 * Skill-based assignment algorithm
 */
async function skillBasedAssignment(
  tenantId: string,
  leadIds: string[],
  skillRequirements?: Record<string, string[]>
): Promise<LeadAssignment[]> {
  const telecallers = await prisma.user.findMany({
    where: {
      tenantId,
      role: "TELECALLER",
      isActive: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      _count: {
        select: {
          assignedLeads: {
            where: {
              status: {
                in: ["NEW", "CONTACTED", "QUALIFIED", "INTERESTED"],
              },
            },
          },
        },
      },
    },
  });

  if (telecallers.length === 0) {
    throw new Error("No active telecallers found");
  }

  const assignments: LeadAssignment[] = [];

  for (const leadId of leadIds) {
    // For now, fallback to load-based if no skill requirements
    if (!skillRequirements || Object.keys(skillRequirements).length === 0) {
      const assignee = telecallers.reduce((min, current) =>
        current._count.assignedLeads < min._count.assignedLeads ? current : min
      );

      assignments.push({
        leadId,
        assigneeId: assignee.id,
        algorithm: "SKILL_BASED",
        assignedAt: new Date(),
      });

      assignee._count.assignedLeads++;
      continue;
    }

    // Find telecaller with matching skills and minimum load
    const suitableTelecallers = telecallers.filter((telecaller) => {
      // This would need to be enhanced with actual skill matching logic
      return true; // Placeholder
    });

    if (suitableTelecallers.length === 0) {
      // Fallback to load-based if no suitable telecallers
      const assignee = telecallers.reduce((min, current) =>
        current._count.assignedLeads < min._count.assignedLeads ? current : min
      );

      assignments.push({
        leadId,
        assigneeId: assignee.id,
        algorithm: "SKILL_BASED",
        assignedAt: new Date(),
      });

      assignee._count.assignedLeads++;
    } else {
      const assignee = suitableTelecallers.reduce((min, current) =>
        current._count.assignedLeads < min._count.assignedLeads ? current : min
      );

      assignments.push({
        leadId,
        assigneeId: assignee.id,
        algorithm: "SKILL_BASED",
        assignedAt: new Date(),
      });

      assignee._count.assignedLeads++;
    }
  }

  return assignments;
}

/**
 * GET /api/:tenant/leads/assignment-stats
 * Get assignment statistics and telecaller workload
 */
router.get(
  "/:tenant/leads/assignment-stats",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;

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

      // Get telecaller workload
      const telecallers = await prisma.user.findMany({
        where: {
          tenantId: tenant.id,
          role: "TELECALLER",
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          _count: {
            select: {
              assignedLeads: {
                where: {
                  status: {
                    in: ["NEW", "CONTACTED", "QUALIFIED", "INTERESTED"],
                  },
                },
              },
            },
          },
        },
      });

      // Get unassigned leads count
      const unassignedCount = await prisma.lead.count({
        where: {
          tenantId: tenant.id,
          assigneeId: null,
          status: "NEW",
        },
      });

      // Get assignment history (last 7 days)
      const assignmentHistory = await prisma.auditLog.findMany({
        where: {
          tenantId: tenant.id,
          action: "LEAD_AUTO_ASSIGNMENT",
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          createdAt: true,
          newValues: true,
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({
        success: true,
        data: {
          telecallers: telecallers.map((t) => ({
            id: t.id,
            name: `${t.firstName} ${t.lastName}`,
            email: t.email,
            currentLoad: t._count.assignedLeads,
          })),
          unassignedLeads: unassignedCount,
          assignmentHistory: assignmentHistory.map((h) => ({
            date: h.createdAt,
            algorithm: (h.newValues as any)?.algorithm,
            assigned: (h.newValues as any)?.assigned,
          })),
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch assignment statistics",
        code: "FETCH_ASSIGNMENT_STATS_ERROR",
      });
    }
  }
);

/**
 * POST /api/:tenant/leads/bulk-import
 * Import leads from CSV/Excel file
 */
router.post(
  "/:tenant/leads/bulk-import",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  upload.single("file"),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;

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

      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
          code: "NO_FILE_UPLOADED",
        });
      }

      const file = req.file;
      let leads: any[] = [];

      // Parse file based on type
      if (file.mimetype === "text/csv") {
        const csvData = file.buffer.toString("utf-8");
        const lines = csvData.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        leads = lines
          .slice(1)
          .map((line) => {
            const values = line.split(",").map((v) => v.trim());
            const lead: any = {};
            headers.forEach((header, index) => {
              lead[header.toLowerCase()] = values[index] || "";
            });
            return lead;
          })
          .filter((lead) => lead.name && (lead.email || lead.phone));
      } else {
        // Excel file
        const workbook = XLSX.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        leads = jsonData
          .map((row: any) => ({
            name: row.name || row.Name || row.NAME || "",
            email: row.email || row.Email || row.EMAIL || "",
            phone: row.phone || row.Phone || row.PHONE || "",
            source: row.source || row.Source || row.SOURCE || "Bulk Import",
            score: row.score || row.Score || row.SCORE || 0,
          }))
          .filter((lead: any) => lead.name && (lead.email || lead.phone));
      }

      if (leads.length === 0) {
        return res.status(400).json({
          error: "No valid leads found in file",
          code: "NO_VALID_LEADS",
        });
      }

      // Validate leads
      const validation = bulkImportSchema.safeParse({ leads });
      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      // Create leads in database
      const createdLeads = await prisma.lead.createMany({
        data: leads.map((lead) => ({
          ...lead,
          tenantId: tenant.id,
          status: "NEW",
        })),
      });

      // Log bulk import
      await prisma.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: req.auth!.sub,
          action: "BULK_LEAD_IMPORT",
          entity: "Lead",
          entityId: "bulk",
          newValues: { count: leads.length, source: "file_upload" },
        },
      });

      res.status(201).json({
        success: true,
        message: `${leads.length} leads imported successfully`,
        data: {
          imported: leads.length,
          leads: leads.slice(0, 5), // Return first 5 for preview
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to import leads",
        code: "IMPORT_LEADS_ERROR",
      });
    }
  }
);

/**
 * POST /api/:tenant/leads/assign
 * Auto-assign leads using configured algorithm
 */
router.post(
  "/:tenant/leads/assign",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;

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

      const validation = assignmentConfigSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const config = validation.data;

      // Get unassigned leads
      const unassignedLeads = await prisma.lead.findMany({
        where: {
          tenantId: tenant.id,
          assigneeId: null,
          status: "NEW",
        },
        select: { id: true },
      });

      if (unassignedLeads.length === 0) {
        return res.json({
          success: true,
          message: "No unassigned leads found",
          data: { assigned: 0 },
        });
      }

      const leadIds = unassignedLeads.map((lead) => lead.id);
      let assignments: LeadAssignment[] = [];

      // Execute assignment algorithm
      switch (config.algorithm) {
        case "ROUND_ROBIN":
          assignments = await roundRobinAssignment(tenant.id, leadIds);
          break;
        case "LOAD_BASED":
          assignments = await loadBasedAssignment(tenant.id, leadIds);
          break;
        case "SKILL_BASED":
          assignments = await skillBasedAssignment(
            tenant.id,
            leadIds,
            config.skillRequirements
          );
          break;
        default:
          throw new Error("Invalid assignment algorithm");
      }

      // Update leads with assignments
      const updatePromises = assignments.map((assignment) =>
        prisma.lead.update({
          where: { id: assignment.leadId },
          data: { assigneeId: assignment.assigneeId },
        })
      );

      await Promise.all(updatePromises);

      // Log assignment
      await prisma.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: req.auth!.sub,
          action: "LEAD_AUTO_ASSIGNMENT",
          entity: "Lead",
          entityId: "bulk",
          newValues: {
            algorithm: config.algorithm,
            assigned: assignments.length,
          },
        },
      });

      res.json({
        success: true,
        message: `${assignments.length} leads assigned successfully`,
        data: {
          assigned: assignments.length,
          algorithm: config.algorithm,
          assignments: assignments.slice(0, 10), // Return first 10 for preview
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to assign leads",
        code: "ASSIGN_LEADS_ERROR",
      });
    }
  }
);

/**
 * GET /api/:tenant/leads
 * Get all leads with filtering and pagination
 */
router.get(
  "/:tenant/leads",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;

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

      const query = leadQuerySchema.parse(req.query);
      const {
        page,
        limit,
        status,
        source,
        assigneeId,
        search,
        sortBy,
        sortOrder,
      } = query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        tenantId: tenant.id,
      };

      if (status) where.status = status;
      if (source) where.source = source;
      if (assigneeId) where.assigneeId = assigneeId;
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ];
      }

      // Get leads with pagination
      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          include: {
            assignee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            notes: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                note: true,
                createdAt: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.lead.count({ where }),
      ]);

      // Get lead statistics
      const stats = await prisma.lead.groupBy({
        by: ["status"],
        where: { tenantId: tenant.id },
        _count: { id: true },
      });

      res.json({
        success: true,
        data: {
          leads,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
          stats: stats.reduce((acc, stat) => {
            acc[stat.status] = stat._count.id;
            return acc;
          }, {} as Record<string, number>),
        },
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch leads",
        code: "FETCH_LEADS_ERROR",
      });
    }
  }
);

/**
 * GET /api/:tenant/leads/:id/notes
 * Get all notes for a lead
 */
router.get(
  "/:tenant/leads/:id/notes",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN", "TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
      const { id, tenant } = req.params;
      const tenantSlug = tenant;
      const userId = req.auth!.sub;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
 
      if (!tenantSlug) {
        return res.status(400).json({
          error: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          error: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }
      

      // Check if lead exists and belongs to the same tenant
      const lead = await prisma.lead.findFirst({
        where: {
          id,
          tenantId: tenantRecord.id,
        },
      });
    
      if (!lead) {
        return res.status(404).json({
          error: "Lead not found",
          code: "LEAD_NOT_FOUND",
        });
      }

      // Get notes
      const notes = await prisma.leadNote.findMany({
        where: { leadId: id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
   

      res.json({
        success: true,
        data: notes,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch lead notes",
        code: "FETCH_LEAD_NOTES_ERROR",
      });
    }
  }
);

/**
 * GET /api/:tenant/leads/:id
 * Get a specific lead by ID
 */
router.get(
  "/:tenant/leads/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN", "TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
  
      const { id, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const lead = await prisma.lead.findFirst({
        where: {
          id,
          tenantId: tenantRecord.id,
        },
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          notes: {
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
          },
          application: {
            include: {
              documents: true,
              payments: true,
            },
          },
        },
      });

      if (!lead) {
        return res.status(404).json({
          message: "Lead not found",
          code: "LEAD_NOT_FOUND",
        });
      }

      // Authorization check for telecallers
      if (
        req.auth!.rol === "TELECALLER" &&
        req.auth!.sub &&
        lead.assigneeId !== req.auth!.sub
      ) {
        return res.status(403).json({
          message: "Access denied. You can only view leads assigned to you.",
          code: "ACCESS_DENIED",
        });
      }

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch lead",
        code: "FETCH_LEAD_ERROR",
      });
    }
  }
);

/**
 * POST /api/:tenant/leads
 * Create a new lead
 */
router.post(
  "/:tenant/leads",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
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
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const validation = createLeadSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const leadData = validation.data;

    
      // Check if assignee exists and belongs to the same tenant
      if (leadData.assigneeId) {
        const assignee = await prisma.user.findFirst({
          where: {
            id: leadData.assigneeId,
            tenantId: tenant.id,
            isActive: true,
          },
        });

        if (!assignee) {
          return res.status(400).json({
            message: "Assignee not found or inactive",
            code: "INVALID_ASSIGNEE",
          });
        }
      }

      // Create lead
      const lead = await prisma.lead.create({
        data: {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          source: leadData.source,
          status: leadData.status,
          score: leadData.score,
          assigneeId: leadData.assigneeId,
          tenantId: tenant.id,
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

      // Add initial note if provided
      if (leadData.notes) {
        await prisma.leadNote.create({
          data: {
            leadId: lead.id,
            userId: req.auth!.sub,
            note: leadData.notes,
          },
        });
      }

      // Log the lead creation
      await prisma.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: req.auth!.sub,
          action: "LEAD_CREATED",
          entity: "Lead",
          entityId: lead.id,
          newValues: leadData,
        },
      });

      // Send real-time notification to assigned telecaller if assignee exists
      if (leadData.assigneeId) {
        try {
          // Get the assignee details for the notification
          const assignee = await prisma.user.findUnique({
            where: { id: leadData.assigneeId },
            select: { firstName: true, lastName: true, email: true },
          });

          // Get the admin who created the lead
          const admin = await prisma.user.findUnique({
            where: { id: req.auth!.sub },
            select: { firstName: true, lastName: true },
          });

          const adminName = admin
            ? `${admin.firstName} ${admin.lastName}`
            : "Admin";

          // Send notification to the assigned telecaller
          await notificationService.sendNotification(
            tenant.id,
            leadData.assigneeId,
            "New Lead Assigned",
            `You have been assigned a new lead: ${leadData.name}${
              leadData.phone ? ` (${leadData.phone})` : ""
            }${leadData.email ? ` - ${leadData.email}` : ""}`,
            "INFO",
            "ASSIGNMENT",
            "LEAD_ASSIGNED",
            "URGENT",
            lead.id,
            {
              leadName: leadData.name,
              leadPhone: leadData.phone,
              leadEmail: leadData.email,
              leadSource: leadData.source,
              leadScore: leadData.score,
              assignedBy: adminName,
              assignedAt: new Date().toISOString(),
              actionUrl: `/telecaller/leads/${lead.id}`,
            }
          );

          
        } catch (notificationError) {
          console.error(
            "Failed to send lead assignment notification:",
            notificationError
          );
          // Don't fail the lead creation if notification fails
        }
      }

      res.status(201).json({
        success: true,
        message: "Lead created successfully",
        data: lead,
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({
        message: "Failed to create lead",
        code: "CREATE_LEAD_ERROR",
      });
    }
  }
);

/**
 * PUT /api/:tenant/leads/:id
 * Update a lead
 */
router.put(
  "/:tenant/leads/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN", "TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
      const { id, tenant } = req.params;

      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }


      const validation = updateLeadSchema.safeParse(req.body);

 

      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const updateData = validation.data;

      // Check if lead exists and belongs to the same tenant
      const existingLead = await prisma.lead.findFirst({
        where: {
          id,
          tenantId: tenantRecord.id,
        },
      });

      if (!existingLead) {
        return res.status(404).json({
          message: "Lead not found",
          code: "LEAD_NOT_FOUND",
        });
      }

      // Authorization check for telecallers
      if (
        req.auth!.rol === "TELECALLER" &&
        existingLead.assigneeId !== req.auth!.sub
      ) {
        return res.status(403).json({
          message: "Access denied. You can only update leads assigned to you.",
          code: "ACCESS_DENIED",
        });
      }

      // Check if assignee exists and belongs to the same tenant
      if (updateData.assigneeId) {
        const assignee = await prisma.user.findFirst({
          where: {
            id: updateData.assigneeId,
            tenantId: tenantRecord.id,
            isActive: true,
          },
        });

        if (!assignee) {
          return res.status(400).json({
            message: "Assignee not found or inactive",
            code: "INVALID_ASSIGNEE",
          });
        }
      }

      // Update lead
      const updatedLead = await prisma.lead.update({
        where: { id },
        data: updateData,
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

      // Log the lead update
      await prisma.auditLog.create({
        data: {
          tenantId: tenantRecord.id,
          userId: req.auth!.sub,
          action: "LEAD_UPDATED",
          entity: "Lead",
          entityId: id,
          oldValues: existingLead,
          newValues: updateData,
        },
      });

      res.json({
        success: true,
        message: "Lead updated successfully",
        data: updatedLead,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update lead",
        code: "UPDATE_LEAD_ERROR",
      });
    }
  }
);

/**
 * DELETE /api/:tenant/leads/:id
 * Delete a lead
 */
router.delete(
  "/:tenant/leads/:id",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const { id, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      // Check if lead exists and belongs to the same tenant
      const lead = await prisma.lead.findFirst({
        where: {
          id,
          tenantId: tenantRecord.id,
        },
      });

      if (!lead) {
        return res.status(404).json({
          message: "Lead not found",
          code: "LEAD_NOT_FOUND",
        });
      }

      // Delete related records first (due to foreign key constraints)
      await prisma.leadNote.deleteMany({
        where: { leadId: id },
      });

      await prisma.callLog.deleteMany({
        where: { leadId: id },
      });

      await prisma.followUpReminder.deleteMany({
        where: { leadId: id },
      });

      // Delete the lead
      await prisma.lead.delete({
        where: { id },
      });

      // Log the lead deletion
      await prisma.auditLog.create({
        data: {
          tenantId: tenantRecord.id,
          userId: req.auth!.sub,
          action: "LEAD_DELETED",
          entity: "Lead",
          entityId: id,
          oldValues: lead,
        },
      });

      res.json({
        success: true,
        message: "Lead deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({
        message: "Failed to delete lead",
        code: "DELETE_LEAD_ERROR",
      });
    }
  }
);

/**
 * POST /api/:tenant/leads/:id/notes
 * Add a note to a lead
 */
router.post(
  "/:tenant/leads/:id/notes",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN", "TELECALLER"]),
  async (req: AuthedRequest, res) => {
    try {
      const userId = req.auth!.sub;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
  
      const { id, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });
    
      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const validation = addNoteSchema.safeParse(req.body);
  
      if (!validation.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }
 
      const { note } = validation.data;

      // Check if lead exists and belongs to the same tenant
      const lead = await prisma.lead.findFirst({
        where: {
          id,
          tenantId: tenantRecord.id,
        },
      });
 
      if (!lead) {
        return res.status(404).json({
          message: "Lead not found",
          code: "LEAD_NOT_FOUND",
        });
      }

      // Authorization check for telecallers
      if (
        req.auth!.rol === "TELECALLER" &&
        req.auth!.sub &&
        lead.assigneeId !== req.auth!.sub
      ) {
        return res.status(403).json({
          message:
            "Access denied. You can only add notes to leads assigned to you.",
          code: "ACCESS_DENIED",
        });
      }

      // Create note
      const leadNote = await prisma.leadNote.create({
        data: {
          leadId: id,
          userId: req.auth!.sub,
          note,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: "Note added successfully",
        data: leadNote,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to add note",
        code: "ADD_NOTE_ERROR",
      });
    }
  }
);

/**
 * POST /api/:tenant/leads/bulk-import
 * Import leads from CSV/Excel file
 */
router.post(
  "/:tenant/leads/bulk-import",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  upload.single("file"),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;
      ("Bulk importing leads");
      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
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
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
          code: "NO_FILE_UPLOADED",
        });
      }

      const file = req.file;
      let leads: any[] = [];

      // Parse file based on type
      if (file.mimetype === "text/csv") {
        const csvData = file.buffer.toString("utf-8");
        const lines = csvData.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        leads = lines
          .slice(1)
          .map((line) => {
            const values = line.split(",").map((v) => v.trim());
            const lead: any = {};
            headers.forEach((header, index) => {
              lead[header.toLowerCase()] = values[index] || "";
            });
            return lead;
          })
          .filter((lead) => lead.name && (lead.email || lead.phone));
      } else {
        // Excel file
        const workbook = XLSX.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        leads = jsonData
          .map((row: any) => ({
            name: row.name || row.Name || row.NAME || "",
            email: row.email || row.Email || row.EMAIL || "",
            phone: row.phone || row.Phone || row.PHONE || "",
            source: row.source || row.Source || row.SOURCE || "Bulk Import",
            score: row.score || row.Score || row.SCORE || 0,
          }))
          .filter((lead: any) => lead.name && (lead.email || lead.phone));
      }

      if (leads.length === 0) {
        return res.status(400).json({
          message: "No valid leads found in file",
          code: "NO_VALID_LEADS",
        });
      }

      // Validate leads
      const validation = bulkImportSchema.safeParse({ leads });
      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      // Create leads in database
      const createdLeads = await prisma.lead.createMany({
        data: leads.map((lead) => ({
          ...lead,
          tenantId: tenant.id,
          status: "NEW",
        })),
      });

      // Log bulk import
      await prisma.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: req.auth!.sub,
          action: "BULK_LEAD_IMPORT",
          entity: "Lead",
          entityId: "bulk",
          newValues: { count: leads.length, source: "file_upload" },
        },
      });

      res.status(201).json({
        success: true,
        message: `${leads.length} leads imported successfully`,
        data: {
          imported: leads.length,
          leads: leads.slice(0, 5), // Return first 5 for preview
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to import leads",
        code: "IMPORT_LEADS_ERROR",
      });
    }
  }
);

/**
 * POST /api/:tenant/leads/assign
 * Auto-assign leads using configured algorithm
 */
router.post(
  "/:tenant/leads/assign",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const tenantSlug = req.params.tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
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
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const validation = assignmentConfigSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const config = validation.data;

      // Get unassigned leads
      const unassignedLeads = await prisma.lead.findMany({
        where: {
          tenantId: tenant.id,
          assigneeId: null,
          status: "NEW",
        },
        select: { id: true },
      });

      if (unassignedLeads.length === 0) {
        return res.json({
          success: true,
          message: "No unassigned leads found",
          data: { assigned: 0 },
        });
      }

      const leadIds = unassignedLeads.map((lead) => lead.id);
      let assignments: LeadAssignment[] = [];

      // Execute assignment algorithm
      switch (config.algorithm) {
        case "ROUND_ROBIN":
          assignments = await roundRobinAssignment(tenant.id, leadIds);
          break;
        case "LOAD_BASED":
          assignments = await loadBasedAssignment(tenant.id, leadIds);
          break;
        case "SKILL_BASED":
          assignments = await skillBasedAssignment(
            tenant.id,
            leadIds,
            config.skillRequirements
          );
          break;
        default:
          throw new Error("Invalid assignment algorithm");
      }

      // Update leads with assignments
      const updatePromises = assignments.map((assignment) =>
        prisma.lead.update({
          where: { id: assignment.leadId },
          data: { assigneeId: assignment.assigneeId },
        })
      );

      await Promise.all(updatePromises);

      // Log assignment
      await prisma.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: req.auth!.sub,
          action: "LEAD_AUTO_ASSIGNMENT",
          entity: "Lead",
          entityId: "bulk",
          newValues: {
            algorithm: config.algorithm,
            assigned: assignments.length,
          },
        },
      });
      // Send bulk assignment notifications
      try {
        // Get the admin who performed the assignment
        const admin = await prisma.user.findUnique({
          where: { id: req.auth!.sub },
          select: { firstName: true, lastName: true },
        });

        const adminName = admin
          ? `${admin.firstName} ${admin.lastName}`
          : "Admin";

        // Group assignments by telecaller
        const assignmentsByTelecaller = assignments.reduce(
          (acc, assignment) => {
            if (!acc[assignment.assigneeId]) {
              acc[assignment.assigneeId] = [];
            }
            acc[assignment.assigneeId].push(assignment.leadId);
            return acc;
          },
          {} as Record<string, string[]>
        );

        // Send one summary notification per telecaller
        for (const [telecallerId, leadIds] of Object.entries(
          assignmentsByTelecaller
        )) {
          await notificationService.sendNotification(
            tenant.id,
            telecallerId,
            "Bulk Lead Assignment",
            `You have been assigned ${leadIds.length} new leads via ${config.algorithm} algorithm`,
            "INFO",
            "ASSIGNMENT",
            "BULK_LEAD_ASSIGNMENT",
            "HIGH",
            undefined, // No specific lead ID for bulk
            {
              assignedCount: leadIds.length,
              algorithm: config.algorithm,
              assignedBy: adminName,
              assignedAt: new Date().toISOString(),
              leadIds: leadIds.slice(0, 5), // Include first 5 lead IDs for reference
              actionUrl: `/telecaller/leads`,
            }
          );
        }

    
      } catch (notificationError) {
        console.error(
          "Failed to send bulk assignment notifications:",
          notificationError
        );
        // Don't fail the assignment if notification fails
      }

      res.json({
        success: true,
        message: `${assignments.length} leads assigned successfully`,
        data: {
          assigned: assignments.length,
          algorithm: config.algorithm,
          assignments: assignments.slice(0, 10), // Return first 10 for preview
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to assign leads",
        code: "ASSIGN_LEADS_ERROR",
      });
    }
  }
);

/**
 * POST /api/:tenant/leads/:id/reassign
 * Reassign a specific lead to a different telecaller
 */
router.post(
  "/:tenant/leads/:id/reassign",
  requireAuth,
  requireActiveUser,
  requireRole(["INSTITUTION_ADMIN"]),
  async (req: AuthedRequest, res) => {
    try {
      const { id, tenant } = req.params;
      const tenantSlug = tenant;

      if (!tenantSlug) {
        return res.status(400).json({
          message: "Tenant slug is required",
          code: "TENANT_REQUIRED",
        });
      }

      // Get tenant
      const tenantRecord = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true },
      });

      if (!tenantRecord) {
        return res.status(404).json({
          message: "Tenant not found",
          code: "TENANT_NOT_FOUND",
        });
      }

      const validation = reassignLeadSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Validation failed",
          details: validation.error.issues,
          code: "VALIDATION_ERROR",
        });
      }

      const { assigneeId, reason } = validation.data;

      // Check if lead exists and belongs to the same tenant
      const existingLead = await prisma.lead.findFirst({
        where: {
          id,
          tenantId: tenantRecord.id,
        },
      });
      if (!existingLead) {
        return res.status(404).json({
          message: "Lead not found",
          code: "LEAD_NOT_FOUND",
        });
      }
      try {
        // Get the admin who reassigned the lead
        const admin = await prisma.user.findUnique({
          where: { id: req.auth!.sub },
          select: { firstName: true, lastName: true },
        });

        const adminName = admin
          ? `${admin.firstName} ${admin.lastName}`
          : "Admin";

        // Notify the new assignee
        await notificationService.sendNotification(
          tenantRecord.id,
          assigneeId,
          "Lead Reassigned to You",
          `You have been assigned lead: ${existingLead.name}${
            existingLead.phone ? ` (${existingLead.phone})` : ""
          }${existingLead.email ? ` - ${existingLead.email}` : ""}`,
          "INFO",
          "ASSIGNMENT",
          "LEAD_REASSIGNED",
          "URGENT",
          id,
          {
            leadName: existingLead.name,
            leadPhone: existingLead.phone,
            leadEmail: existingLead.email,
            leadSource: existingLead.source,
            leadScore: existingLead.score,
            assignedBy: adminName,
            reason: reason || "No reason provided",
            assignedAt: new Date().toISOString(),
            actionUrl: `/telecaller/leads/${id}`,
          }
        );

        // Notify the previous assignee if they exist
        if (existingLead.assigneeId && existingLead.assigneeId !== assigneeId) {
          await notificationService.sendNotification(
            tenantRecord.id,
            existingLead.assigneeId,
            "Lead Reassigned",
            `Lead ${existingLead.name} has been reassigned to another telecaller`,
            "WARNING",
            "ASSIGNMENT",
            "LEAD_UNASSIGNED",
            "MEDIUM",
            id,
            {
              leadName: existingLead.name,
              leadPhone: existingLead.phone,
              leadEmail: existingLead.email,
              reassignedBy: adminName,
              reason: reason || "No reason provided",
              reassignedAt: new Date().toISOString(),
            }
          );
        }

        
      } catch (notificationError) {
        console.error(
          "Failed to send lead reassignment notifications:",
          notificationError
        );
        // Don't fail the reassignment if notification fails
      }

      if (!existingLead) {
        return res.status(404).json({
          message: "Lead not found",
          code: "LEAD_NOT_FOUND",
        });
      }

      // Check if new assignee exists and is a telecaller
      const assignee = await prisma.user.findFirst({
        where: {
          id: assigneeId,
          tenantId: tenantRecord.id,
          role: "TELECALLER",
          isActive: true,
        },
      });

      if (!assignee) {
        return res.status(400).json({
          message: "Invalid assignee or assignee is not a telecaller",
          code: "INVALID_ASSIGNEE",
        });
      }

      // Update lead assignment
      const updatedLead = await prisma.lead.update({
        where: { id },
        data: { assigneeId },
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

      // Add note about reassignment
      await prisma.leadNote.create({
        data: {
          leadId: id,
          userId: req.auth!.sub,
          note: `Lead reassigned to ${assignee.firstName} ${assignee.lastName}${
            reason ? `. Reason: ${reason}` : ""
          }`,
        },
      });

      // Log reassignment
      await prisma.auditLog.create({
        data: {
          tenantId: tenantRecord.id,
          userId: req.auth!.sub,
          action: "LEAD_REASSIGNED",
          entity: "Lead",
          entityId: id,
          oldValues: { assigneeId: existingLead.assigneeId },
          newValues: { assigneeId, reason },
        },
      });

      // Send real-time notifications for reassignment
      try {
        // Get the admin who reassigned the lead
        const admin = await prisma.user.findUnique({
          where: { id: req.auth!.sub },
          select: { firstName: true, lastName: true },
        });

        const adminName = admin
          ? `${admin.firstName} ${admin.lastName}`
          : "Admin";

        // Notify the new assignee
        await notificationService.sendNotification(
          tenantRecord.id,
          assigneeId,
          "Lead Reassigned to You",
          `You have been assigned lead: ${existingLead.name}${
            existingLead.phone ? ` (${existingLead.phone})` : ""
          }${existingLead.email ? ` - ${existingLead.email}` : ""}`,
          "INFO",
          "ASSIGNMENT",
          "LEAD_REASSIGNED",
          "URGENT",
          id,
          {
            leadName: existingLead.name,
            leadPhone: existingLead.phone,
            leadEmail: existingLead.email,
            leadSource: existingLead.source,
            leadScore: existingLead.score,
            assignedBy: adminName,
            reason: reason || "No reason provided",
            assignedAt: new Date().toISOString(),
            actionUrl: `/telecaller/leads/${id}`,
          }
        );

        // Notify the previous assignee if they exist
        if (existingLead.assigneeId && existingLead.assigneeId !== assigneeId) {
          await notificationService.sendNotification(
            tenantRecord.id,
            existingLead.assigneeId,
            "Lead Reassigned",
            `Lead ${existingLead.name} has been reassigned to another telecaller`,
            "WARNING",
            "ASSIGNMENT",
            "LEAD_UNASSIGNED",
            "MEDIUM",
            id,
            {
              leadName: existingLead.name,
              leadPhone: existingLead.phone,
              leadEmail: existingLead.email,
              reassignedBy: adminName,
              reason: reason || "No reason provided",
              reassignedAt: new Date().toISOString(),
            }
          );
        }

      } catch (notificationError) {
        console.error(
          "Failed to send lead reassignment notifications:",
          notificationError
        );
        // Don't fail the reassignment if notification fails
      }

      res.json({
        success: true,
        message: "Lead reassigned successfully",
        data: updatedLead,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to reassign lead",
        code: "REASSIGN_LEAD_ERROR",
      });
    }
  }
);

export default router;
