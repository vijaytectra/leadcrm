import { getClientToken } from "../client-token";
import {
  apiGetClientNew,
  apiPostClientNew,
  apiPutClient,
  apiDeleteClient,
} from "../utils";

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  status: string;
  score: number;
  assigneeId?: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  notes?: Array<{
    id: string;
    note: string;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      role: string;
    };
  }>;
}

export interface CreateLeadRequest {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: string;
  score?: number;
  assigneeId?: string;
  notes?: string;
}

export interface UpdateLeadRequest {
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
  status?: string;
  score?: number;
  assigneeId?: string;
}

export interface LeadNote {
  id: string;
  note: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface AddNoteRequest {
  note: string;
}

export interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: Record<string, number>;
}

export interface LeadResponse {
  lead: Lead;
}

export interface CreateLeadResponse {
  lead: Lead;
}

export interface AssignmentConfig {
  algorithm: "ROUND_ROBIN" | "LOAD_BASED" | "SKILL_BASED";
  autoAssign: boolean;
  maxLeadsPerUser: number;
  skillRequirements?: Record<string, string[]>;
}

export interface AssignmentStats {
  telecallers: Array<{
    id: string;
    name: string;
    email: string;
    currentLoad: number;
  }>;
  unassignedLeads: number;
  assignmentHistory: Array<{
    date: string;
    algorithm: string;
    assigned: number;
  }>;
}

export interface ReassignLeadRequest {
  assigneeId: string;
  reason?: string;
}

// Mock data for fallbacks during development
const MOCK_ASSIGNMENT_STATS: AssignmentStats = {
  telecallers: [
    {
      id: "user1",
      name: "Jane Smith",
      email: "jane@company.com",
      currentLoad: 15,
    },
    {
      id: "user2",
      name: "Bob Wilson",
      email: "bob@company.com",
      currentLoad: 12,
    },
  ],
  unassignedLeads: 8,
  assignmentHistory: [
    {
      date: new Date().toISOString(),
      algorithm: "ROUND_ROBIN",
      assigned: 5,
    },
  ],
};

/**
 * Get all leads with filtering and pagination
 */
export async function getLeads(
  tenantSlug: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    source?: string;
    assigneeId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
): Promise<LeadsResponse> {
  try {
    const token = getClientToken();
    if (!token) {
      throw new Error("No token found");
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.source) queryParams.append("source", params.source);
    if (params?.assigneeId) queryParams.append("assigneeId", params.assigneeId);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    // Fixed: Removed /api prefix since utils.ts already adds it
    const url = `/${tenantSlug}/leads${queryString ? `?${queryString}` : ""}`;

    const response = await apiGetClientNew<{ data: LeadsResponse }>(url, {
      token: token,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }
}

/**
 * Get a specific lead by ID
 */
export async function getLead(
  tenantSlug: string,
  leadId: string
): Promise<Lead> {
  try {
    const token = getClientToken();
    if (!token) {
      throw new Error("No token found");
    }

    // Fixed: Removed /api prefix
    const response = await apiGetClientNew<{ data: Lead }>(
      `/${tenantSlug}/leads/${leadId}`,
      {
        token: token,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching lead:", error);
    throw error;
  }
}

/**
 * Create a new lead
 */
export async function createLead(
  tenantSlug: string,
  leadData: CreateLeadRequest
): Promise<Lead> {
  try {
    const token = getClientToken();
    if (!token) {
      throw new Error("No token found");
    }

    // Fixed: Removed /api prefix
    const response = await apiPostClientNew<{ data: Lead }>(
      `/${tenantSlug}/leads`,
      leadData,
      {
        token: token,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating lead:", error);
    throw error;
  }
}

/**
 * Update a lead
 */
export async function updateLead(
  tenantSlug: string,
  leadId: string,
  leadData: UpdateLeadRequest
): Promise<Lead> {
  try {
    const token = getClientToken();
    if (!token) {
      throw new Error("No token found");
    }

    // Fixed: Removed /api prefix
    const response = await apiPutClient<{ data: Lead }>(
      `/${tenantSlug}/leads/${leadId}`,
      leadData,
      {
        token: token,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating lead:", error);
    throw error;
  }
}

/**
 * Delete a lead
 */
export async function deleteLead(
  tenantSlug: string,
  leadId: string
): Promise<void> {
  try {
    const token = getClientToken();
    if (!token) {
      throw new Error("No token found");
    }

    // Fixed: Use proper DELETE method
    await apiDeleteClient(`/${tenantSlug}/leads/${leadId}`, { token: token });
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
}

/**
 * Add a note to a lead
 */
export async function addLeadNote(
  tenantSlug: string,
  leadId: string,
  noteData: AddNoteRequest
): Promise<LeadNote> {
  try {
    const token = getClientToken();
    if (!token) {
      throw new Error("No token found");
    }
    console.log("tenantSlug", tenantSlug);
    console.log("leadId", leadId);
    console.log("noteData", noteData);

    // Fixed: Removed /api prefix
    const response = await apiPostClientNew<{ data: LeadNote }>(
      `/${tenantSlug}/leads/${leadId}/notes`,
      noteData,
      { token: token }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding lead note:", error);
    throw error;
  }
}

/**
 * Get all notes for a lead
 */
export async function getLeadNotes(
  tenantSlug: string,
  leadId: string
): Promise<LeadNote[]> {
  try {
    const token = getClientToken();
    if (!token) {
      throw new Error("No token found");
    }
    console.log("tenantSlug", tenantSlug);
    console.log("leadId", leadId);

    // Fixed: Removed /api prefix
    const response = await apiGetClientNew<{ data: LeadNote[] }>(
      `/${tenantSlug}/leads/${leadId}/notes`,
      { token: token }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching lead notes:", error);
    throw error;
  }
}

/**
 * Import leads from CSV/Excel file
 */
export async function importLeads(
  tenantSlug: string,
  file: File
): Promise<{ imported: number; leads: Lead[] }> {
  try {
    const token = getClientToken();
    if (!token) {
      throw new Error("No token found");
    }

    console.log("tenantSlug", tenantSlug);

    // Create FormData object
    const formData = new FormData();
    formData.append("file", file);

    // This function uses direct fetch, so we need the full path with /api
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
      }/api/${tenantSlug}/leads/bulk-import`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: "Unknown error",
        code: "UNKNOWN_ERROR",
      }));
      throw new Error(errorData.error || "Failed to import leads");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error importing leads:", error);
    throw error;
  }
}

/**
 * Auto-assign leads using configured algorithm
 */
export async function assignLeads(
  tenantSlug: string,
  config: AssignmentConfig
): Promise<{ assigned: number; algorithm: string; assignments: Lead[] }> {
  try {
    const token = getClientToken();
    if (!token) {
      throw new Error("No token found");
    }

    // Fixed: Removed /api prefix
    const response = await apiPostClientNew<{
      data: { assigned: number; algorithm: string; assignments: Lead[] };
    }>(`/${tenantSlug}/leads/assign`, config, {
      token: token,
    });
    return response.data;
  } catch (error) {
    console.error("Error assigning leads:", error);
    throw error;
  }
}

/**
 * Reassign a lead to a different telecaller
 */
export async function reassignLead(
  tenantSlug: string,
  leadId: string,
  reassignData: ReassignLeadRequest
): Promise<Lead> {
  try {
    const token = getClientToken();
    if (!token) {
      throw new Error("No token found");
    }

    // Fixed: Removed /api prefix
    const response = await apiPostClientNew<{ data: Lead }>(
      `/${tenantSlug}/leads/${leadId}/reassign`,
      reassignData,
      { token: token }
    );
    return response.data;
  } catch (error) {
    console.error("Error reassigning lead:", error);
    throw error;
  }
}

/**
 * Get assignment statistics and telecaller workload
 */
export async function getAssignmentStats(
  tenantSlug: string
): Promise<AssignmentStats> {
  try {
    const token = getClientToken();
    if (!token) {
      throw new Error("No token found");
    }

    // Fixed: Removed /api prefix since utils.ts already adds it
    const response = await apiGetClientNew<{ data: AssignmentStats }>(
      `/${tenantSlug}/leads/assignment-stats`,
      { token: token }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching assignment stats:", error);

    // Return mock data as fallback during development
    console.warn("Using mock assignment stats due to API error");
    return MOCK_ASSIGNMENT_STATS;
  }
}
