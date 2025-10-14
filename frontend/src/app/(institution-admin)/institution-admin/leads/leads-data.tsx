import { getLeads } from "@/lib/api/leads";
import { getUsers } from "@/lib/api/users";
import { getAssignmentStats } from "@/lib/api/leads";

export interface LeadsPageData {
  leads: any[];
  users: any[];
  stats: Record<string, number> | null;
  assignmentStats: any;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function getLeadsPageData(
  tenantSlug: string,
  searchParams: {
    page?: string;
    limit?: string;
    status?: string;
    source?: string;
    assigneeId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }
): Promise<LeadsPageData> {
  try {
    const filters = {
      page: searchParams.page ? parseInt(searchParams.page) : 1,
      limit: searchParams.limit ? parseInt(searchParams.limit) : 10,
      status: searchParams.status || "",
      source: searchParams.source || "",
      assigneeId: searchParams.assigneeId || "",
      search: searchParams.search || "",
      sortBy: searchParams.sortBy || "createdAt",
      sortOrder: (searchParams.sortOrder as "asc" | "desc") || "desc"
    };

    const [leadsResponse, users, assignmentStats] = await Promise.all([
      getLeads(tenantSlug, filters),
      getUsers(tenantSlug),
      getAssignmentStats(tenantSlug)
    ]);

    return {
      leads: leadsResponse.leads,
      users,
      stats: leadsResponse.stats,
      assignmentStats,
      pagination: leadsResponse.pagination
    };
  } catch (error) {
    console.error("Error fetching leads page data:", error);
    throw error;
  }
}
