import { getToken } from "../getToken";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface TelecallerDashboardData {
  leadsByStatus: Record<string, number>;
  todayStats: {
    callsMade: number;
    callsAnswered: number;
    callsConverted: number;
    totalDuration: number;
  };
  recentCalls: Array<{
    id: string;
    status: string;
    outcome?: string;
    duration?: number;
    lead: {
      id: string;
      name: string;
      phone?: string;
    };
  }>;
  pendingFollowUps: Array<{
    id: string;
    type: string;
    priority: string;
    scheduledAt: string;
    notes?: string;
    lead: {
      id: string;
      name: string;
      phone?: string;
      status: string;
    };
  }>;
  performanceData: Array<{
    date: string;
    callsMade: number;
    callsAnswered: number;
    callsConverted: number;
    conversionRate: number;
    responseRate: number;
  }>;
}

export interface CallLog {
  id: string;
  callType: string;
  status: string;
  outcome?: string;
  duration?: number;
  notes?: string;
  recordingUrl?: string;
  recordingId?: string;
  createdAt: string;
  lead: {
    id: string;
    name: string;
    phone?: string;
    status: string;
  };
}

export interface FollowUpReminder {
  id: string;
  type: string;
  priority: string;
  status: string;
  scheduledAt: string;
  notes?: string;
  completedAt?: string;
  lead: {
    id: string;
    name: string;
    phone?: string;
    status: string;
  };
}

export interface PerformanceMetrics {
  period: string;
  metrics: {
    totalCalls: number;
    answeredCalls: number;
    convertedCalls: number;
    totalDuration: number;
    avgCallDuration: number;
    conversionRate: number;
    responseRate: number;
  };
  performanceData: Array<{
    date: string;
    callsMade: number;
    callsAnswered: number;
    callsConverted: number;
    conversionRate: number;
    responseRate: number;
  }>;
  callLogs: Array<{
    status: string;
    outcome?: string;
    duration?: number;
    createdAt: string;
  }>;
}

export interface CreateCallLogRequest {
  leadId: string;
  callType: "INBOUND" | "OUTBOUND" | "FOLLOW_UP" | "SCHEDULED";
  status:
    | "INITIATED"
    | "RINGING"
    | "ANSWERED"
    | "BUSY"
    | "NO_ANSWER"
    | "FAILED"
    | "COMPLETED"
    | "CANCELLED";
  duration?: number;
  outcome?:
    | "SUCCESSFUL"
    | "NO_ANSWER"
    | "BUSY"
    | "WRONG_NUMBER"
    | "NOT_INTERESTED"
    | "CALLBACK_REQUESTED"
    | "INTERESTED"
    | "QUALIFIED"
    | "NOT_QUALIFIED"
    | "FOLLOW_UP_SCHEDULED";
  notes?: string;
  recordingUrl?: string;
  recordingId?: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
}

export interface UpdateCallLogRequest {
  status?:
    | "INITIATED"
    | "RINGING"
    | "ANSWERED"
    | "BUSY"
    | "NO_ANSWER"
    | "FAILED"
    | "COMPLETED"
    | "CANCELLED";
  duration?: number;
  outcome?:
    | "SUCCESSFUL"
    | "NO_ANSWER"
    | "BUSY"
    | "WRONG_NUMBER"
    | "NOT_INTERESTED"
    | "CALLBACK_REQUESTED"
    | "INTERESTED"
    | "QUALIFIED"
    | "NOT_QUALIFIED"
    | "FOLLOW_UP_SCHEDULED";
  notes?: string;
  recordingUrl?: string;
  recordingId?: string;
  startedAt?: string;
  endedAt?: string;
}

export interface CreateFollowUpRequest {
  leadId: string;
  type: "CALL" | "EMAIL" | "SMS" | "WHATSAPP" | "MEETING";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  scheduledAt: string;
  notes?: string;
}

export interface UpdateFollowUpRequest {
  status?: "PENDING" | "COMPLETED" | "CANCELLED" | "OVERDUE";
  notes?: string;
  completedAt?: string;
}

export interface UpdateLeadStatusRequest {
  status:
    | "NEW"
    | "CONTACTED"
    | "QUALIFIED"
    | "INTERESTED"
    | "APPLICATION_STARTED"
    | "DOCUMENTS_SUBMITTED"
    | "UNDER_REVIEW"
    | "ADMITTED"
    | "ENROLLED"
    | "REJECTED"
    | "LOST";
  notes?: string;
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; error?: string }> {
  try {
    const token = await getToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return { success: true, data: data.data || data };
  } catch (error) {
    console.error("API request failed:", error);
    return {
      success: false,
      data: {} as T,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getTelecallerDashboard(tenantSlug: string): Promise<{
  success: boolean;
  data: TelecallerDashboardData;
  error?: string;
}> {
  return makeRequest<TelecallerDashboardData>(
    `/api/${tenantSlug}/telecaller/dashboard`
  );
}

export async function getTelecallerLeads(
  tenantSlug: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
): Promise<{
  success: boolean;
  data: {
    leads: Array<{
      id: string;
      name: string;
      email?: string;
      phone?: string;
      source?: string;
      status: string;
      score: number;
      createdAt: string;
      updatedAt: string;
      notes: Array<{
        id: string;
        note: string;
        createdAt: string;
        user: {
          firstName?: string;
          lastName?: string;
        };
      }>;
      callLogs: Array<{
        id: string;
        callType: string;
        status: string;
        outcome?: string;
        duration?: number;
        createdAt: string;
      }>;
      followUpReminders: Array<{
        id: string;
        type: string;
        priority: string;
        scheduledAt: string;
      }>;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  error?: string;
}> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const queryString = searchParams.toString();
  const endpoint = `/api/${tenantSlug}/telecaller/leads${
    queryString ? `?${queryString}` : ""
  }`;

  return makeRequest(endpoint);
}

export async function createCallLog(
  tenantSlug: string,
  data: CreateCallLogRequest
): Promise<{
  success: boolean;
  data: CallLog;
  error?: string;
}> {
  return makeRequest<CallLog>(`/api/${tenantSlug}/telecaller/call-logs`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCallLog(
  tenantSlug: string,
  callLogId: string,
  data: UpdateCallLogRequest
): Promise<{
  success: boolean;
  data: CallLog;
  error?: string;
}> {
  return makeRequest<CallLog>(
    `/api/${tenantSlug}/telecaller/call-logs/${callLogId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function getCallLogs(
  tenantSlug: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    outcome?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
): Promise<{
  success: boolean;
  data: {
    callLogs: CallLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  error?: string;
}> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.status) searchParams.set("status", params.status);
  if (params?.outcome) searchParams.set("outcome", params.outcome);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const queryString = searchParams.toString();
  const endpoint = `/api/${tenantSlug}/telecaller/call-logs${
    queryString ? `?${queryString}` : ""
  }`;

  return makeRequest(endpoint);
}

export async function createFollowUpReminder(
  tenantSlug: string,
  data: CreateFollowUpRequest
): Promise<{
  success: boolean;
  data: FollowUpReminder;
  error?: string;
}> {
  return makeRequest<FollowUpReminder>(
    `/api/${tenantSlug}/telecaller/follow-ups`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updateFollowUpReminder(
  tenantSlug: string,
  followUpId: string,
  data: UpdateFollowUpRequest
): Promise<{
  success: boolean;
  data: FollowUpReminder;
  error?: string;
}> {
  return makeRequest<FollowUpReminder>(
    `/api/${tenantSlug}/telecaller/follow-ups/${followUpId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function getFollowUpReminders(
  tenantSlug: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    type?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
): Promise<{
  success: boolean;
  data: {
    reminders: FollowUpReminder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  error?: string;
}> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.status) searchParams.set("status", params.status);
  if (params?.priority) searchParams.set("priority", params.priority);
  if (params?.type) searchParams.set("type", params.type);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  const queryString = searchParams.toString();
  const endpoint = `/api/${tenantSlug}/telecaller/follow-ups${
    queryString ? `?${queryString}` : ""
  }`;

  return makeRequest(endpoint);
}

export async function updateLeadStatus(
  tenantSlug: string,
  leadId: string,
  data: UpdateLeadStatusRequest
): Promise<{
  success: boolean;
  data: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    status: string;
    score: number;
    assignee?: {
      id: string;
      firstName?: string;
      lastName?: string;
      email: string;
    };
  };
  error?: string;
}> {
  return makeRequest(`/api/${tenantSlug}/telecaller/leads/${leadId}/status`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getPerformanceMetrics(
  tenantSlug: string,
  period: "1d" | "7d" | "30d" | "90d" = "7d"
): Promise<{
  success: boolean;
  data: PerformanceMetrics;
  error?: string;
}> {
  return makeRequest<PerformanceMetrics>(
    `/api/${tenantSlug}/telecaller/performance?period=${period}`
  );
}

export async function completeFollowUpReminder(
  tenantSlug: string,
  reminderId: string
): Promise<{
  success: boolean;
  data: FollowUpReminder;
  error?: string;
}> {
  return makeRequest<FollowUpReminder>(
    `/api/${tenantSlug}/telecaller/follow-ups/${reminderId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
      }),
    }
  );
}

export async function cancelFollowUpReminder(
  tenantSlug: string,
  reminderId: string
): Promise<{
  success: boolean;
  data: FollowUpReminder;
  error?: string;
}> {
  return makeRequest<FollowUpReminder>(
    `/api/${tenantSlug}/telecaller/follow-ups/${reminderId}`,
    {
      method: "PUT",
      body: JSON.stringify({ status: "CANCELLED" }),
    }
  );
}
