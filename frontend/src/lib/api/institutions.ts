import { apiGetClient, apiPutClient, apiDeleteClient } from "@/lib/utils";
import { getClientToken } from "@/lib/client-token";

export interface Institution {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  subscriptionTier: "STARTER" | "PRO" | "MAX";
  subscriptionStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
  subscriptionStart: string;
  subscriptionEnd: string;
  maxLeads: number;
  maxTeamMembers: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    leads: number;
    payments: number;
  };
  users?: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  }>;
}

export interface UpdateInstitutionData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  subscriptionTier?: "STARTER" | "PRO" | "MAX";
  subscriptionStatus?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
  maxLeads?: number;
  maxTeamMembers?: number;
}

export interface InstitutionResponse {
  success: boolean;
  data: Institution;
  message?: string;
}

export interface InstitutionListResponse {
  success: boolean;
  data: Institution[];
  message?: string;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
}

/**
 * Get institution by ID
 */
export const getInstitutionById = async (id: string): Promise<Institution> => {
  const token = getClientToken();
  if (!token) throw new Error("No authentication token found");

  const response = await apiGetClient<InstitutionResponse>(
    `/super-admin/institutions/${id}`,
    token
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch institution");
  }

  return response.data;
};

/**
 * Update institution
 */
export const updateInstitution = async (
  id: string,
  data: UpdateInstitutionData
): Promise<Institution> => {
  const token = getClientToken();
  if (!token) throw new Error("No authentication token found");

  const response = await apiPutClient<InstitutionResponse>(
    `/super-admin/institutions/${id}`,
    data,
    { token: token }
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to update institution");
  }

  return response.data;
};

/**
 * Delete institution
 */
export const deleteInstitution = async (id: string): Promise<void> => {
  const token = getClientToken();
  if (!token) throw new Error("No authentication token found");

  const response = await apiDeleteClient<InstitutionResponse>(
    `/super-admin/institutions/${id}`,
    { token: token }
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to delete institution");
  }
};

/**
 * Get institutions list with pagination and filters
 */
export const getInstitutions = async (
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    subscriptionTier?: string;
  } = {}
): Promise<InstitutionListResponse> => {
  const token = getClientToken();
  if (!token) throw new Error("No authentication token found");

  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.pageSize) queryParams.append("limit", params.pageSize.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.status) queryParams.append("status", params.status);
  if (params.subscriptionTier)
    queryParams.append("subscriptionTier", params.subscriptionTier);

  const response = await apiGetClient<InstitutionListResponse>(
    `/super-admin/institutions?${queryParams.toString()}`,
    token
  );

  if (!response.success) {
    throw new Error(response.message || "Failed to fetch institutions");
  }

  return response;
};
