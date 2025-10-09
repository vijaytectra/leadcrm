import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Validation schemas
const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format").optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional(),
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
    .optional(),
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
    .optional(),
  score: z.number().min(0).max(100).optional(),
  assigneeId: z.string().optional(),
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

/**
 * GET /api/leads
 * Get all leads with filtering and pagination
 */
router.get("/leads", requireAuth, async (req: AuthedRequest, res) => {
  try {
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
      tenantId: req.auth!.ten,
    };

    if (status) where.status = status;
    if (source) where.source = source;
    if (assigneeId) where.assigneeId = assigneeId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
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
      where: { tenantId: req.auth!.ten },
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
    console.error("Error fetching leads:", error);
    res.status(500).json({
      error: "Failed to fetch leads",
      code: "FETCH_LEADS_ERROR",
    });
  }
});

/**
 * GET /api/leads/:id
 * Get a specific lead by ID
 */
router.get("/leads/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        tenantId: req.auth!.ten,
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
        error: "Lead not found",
        code: "LEAD_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({
      error: "Failed to fetch lead",
      code: "FETCH_LEAD_ERROR",
    });
  }
});

/**
 * POST /api/leads
 * Create a new lead
 */
router.post("/leads", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const validation = createLeadSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
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
          tenantId: req.auth!.ten,
          isActive: true,
        },
      });

      if (!assignee) {
        return res.status(400).json({
          error: "Assignee not found or inactive",
          code: "INVALID_ASSIGNEE",
        });
      }
    }

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        ...leadData,
        tenantId: req.auth!.ten,
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
        tenantId: req.auth!.ten,
        userId: req.auth!.sub,
        action: "LEAD_CREATED",
        entity: "Lead",
        entityId: lead.id,
        newValues: leadData,
      },
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({
      error: "Failed to create lead",
      code: "CREATE_LEAD_ERROR",
    });
  }
});

/**
 * PUT /api/leads/:id
 * Update a lead
 */
router.put("/leads/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const validation = updateLeadSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.issues,
        code: "VALIDATION_ERROR",
      });
    }

    const updateData = validation.data;

    // Check if lead exists and belongs to the same tenant
    const existingLead = await prisma.lead.findFirst({
      where: {
        id,
        tenantId: req.auth!.ten,
      },
    });

    if (!existingLead) {
      return res.status(404).json({
        error: "Lead not found",
        code: "LEAD_NOT_FOUND",
      });
    }

    // Check if assignee exists and belongs to the same tenant
    if (updateData.assigneeId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: updateData.assigneeId,
          tenantId: req.auth!.ten,
          isActive: true,
        },
      });

      if (!assignee) {
        return res.status(400).json({
          error: "Assignee not found or inactive",
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
        tenantId: req.auth!.ten,
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
    console.error("Error updating lead:", error);
    res.status(500).json({
      error: "Failed to update lead",
      code: "UPDATE_LEAD_ERROR",
    });
  }
});

/**
 * DELETE /api/leads/:id
 * Delete a lead
 */
router.delete("/leads/:id", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if lead exists and belongs to the same tenant
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        tenantId: req.auth!.ten,
      },
    });

    if (!lead) {
      return res.status(404).json({
        error: "Lead not found",
        code: "LEAD_NOT_FOUND",
      });
    }

    // Delete lead (cascade will handle related records)
    await prisma.lead.delete({
      where: { id },
    });

    // Log the lead deletion
    await prisma.auditLog.create({
      data: {
        tenantId: req.auth!.ten,
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
      error: "Failed to delete lead",
      code: "DELETE_LEAD_ERROR",
    });
  }
});

/**
 * POST /api/leads/:id/notes
 * Add a note to a lead
 */
router.post(
  "/leads/:id/notes",
  requireAuth,
  async (req: AuthedRequest, res) => {
    try {
      const { id } = req.params;
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
          tenantId: req.auth!.ten,
        },
      });

      if (!lead) {
        return res.status(404).json({
          error: "Lead not found",
          code: "LEAD_NOT_FOUND",
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
      console.error("Error adding note:", error);
      res.status(500).json({
        error: "Failed to add note",
        code: "ADD_NOTE_ERROR",
      });
    }
  }
);

/**
 * GET /api/leads/:id/notes
 * Get all notes for a lead
 */
router.get("/leads/:id/notes", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if lead exists and belongs to the same tenant
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        tenantId: req.auth!.ten,
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
    console.error("Error fetching lead notes:", error);
    res.status(500).json({
      error: "Failed to fetch lead notes",
      code: "FETCH_LEAD_NOTES_ERROR",
    });
  }
});

export default router;
