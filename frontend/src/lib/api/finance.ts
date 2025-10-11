// Finance API types and functions

export interface Payment {
  id: string;
  tenantId: string;
  applicationId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  paymentMethod: string;
  transactionId?: string;
  gatewayResponse?: any;
  createdAt: string;
  updatedAt: string;
  application?: {
    id: string;
    studentName: string;
    studentEmail: string;
  };
}

export interface RefundRequest {
  id: string;
  tenantId: string;
  applicationId?: string;
  paymentId?: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  amount: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED";
  requestedBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  application?: {
    id: string;
    studentName: string;
    studentEmail: string;
  };
  payment?: Payment;
  approvals?: RefundApproval[];
  auditLogs?: FinancialAuditLog[];
}

export interface RefundApproval {
  id: string;
  refundRequestId: string;
  approverId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  comments?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface FinancialAuditLog {
  id: string;
  tenantId: string;
  refundRequestId?: string;
  action: string;
  details: any;
  performedBy: string;
  performedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface FinancialDashboardData {
  stats: {
    totalRevenue: number;
    monthlyRevenue: number;
    pendingPayments: number;
    refundRequests: number;
    averageTransactionValue: number;
    conversionRate: number;
  };
  recentTransactions: Payment[];
  revenueData: Array<{
    month: string;
    revenue: number;
  }>;
  paymentStatusDistribution: {
    completed: number;
    pending: number;
    failed: number;
  };
}

export interface RefundRequestData {
  applicationId?: string;
  paymentId?: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  amount: number;
  reason: string;
}

export interface RefundApprovalData {
  status: "APPROVED" | "REJECTED";
  comments?: string;
  rejectionReason?: string;
}

export interface FinancialReportData {
  startDate: string;
  endDate: string;
  reportType: "SUMMARY" | "REVENUE" | "REFUNDS" | "DETAILED";
  format?: "JSON" | "EXCEL" | "PDF";
}

// API Functions using existing utils
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/utils";

export const financeApi = {
  // Financial Dashboard
  getDashboard: async (tenant: string) => {
    return apiGet(`/api/${tenant}/finance/dashboard`);
  },

  // Payments
  getPayments: async (
    tenant: string,
    params?: {
      status?: string;
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);

    const query = searchParams.toString();
    return apiGet(`/api/${tenant}/finance/payments${query ? `?${query}` : ""}`);
  },

  getPayment: async (tenant: string, paymentId: string) => {
    return apiGet(`/api/${tenant}/finance/payments/${paymentId}`);
  },

  // Refund Requests
  createRefundRequest: async (tenant: string, data: RefundRequestData) => {
    return apiPost(`/api/${tenant}/finance/refunds`, data);
  },

  getRefundRequests: async (
    tenant: string,
    params?: {
      status?: string;
      page?: number;
      limit?: number;
    }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const query = searchParams.toString();
    return apiGet(`/api/${tenant}/finance/refunds${query ? `?${query}` : ""}`);
  },

  getRefundRequest: async (tenant: string, refundId: string) => {
    return apiGet(`/api/${tenant}/finance/refunds/${refundId}`);
  },

  approveRefund: async (
    tenant: string,
    refundId: string,
    data: RefundApprovalData
  ) => {
    return apiPut(`/api/${tenant}/finance/refunds/${refundId}/approve`, data);
  },

  getRefundAuditTrail: async (tenant: string, refundId: string) => {
    return apiGet(`/api/${tenant}/finance/refunds/${refundId}/audit-trail`);
  },

  // Financial Reports
  getFinancialReport: async (tenant: string, data: FinancialReportData) => {
    return apiPost(`/api/${tenant}/finance/reports/summary`, data);
  },

  getRevenueReport: async (
    tenant: string,
    params: {
      startDate: string;
      endDate: string;
      format?: string;
    }
  ) => {
    const searchParams = new URLSearchParams();
    searchParams.append("startDate", params.startDate);
    searchParams.append("endDate", params.endDate);
    if (params.format) searchParams.append("format", params.format);

    return apiGet(
      `/api/${tenant}/finance/reports/revenue?${searchParams.toString()}`
    );
  },

  getRefundReport: async (
    tenant: string,
    params: {
      startDate: string;
      endDate: string;
      format?: string;
    }
  ) => {
    const searchParams = new URLSearchParams();
    searchParams.append("startDate", params.startDate);
    searchParams.append("endDate", params.endDate);
    if (params.format) searchParams.append("format", params.format);

    return apiGet(
      `/api/${tenant}/finance/reports/refunds?${searchParams.toString()}`
    );
  },

  exportReport: async (
    tenant: string,
    reportType: string,
    format: string,
    params: {
      startDate: string;
      endDate: string;
    }
  ) => {
    const searchParams = new URLSearchParams();
    searchParams.append("startDate", params.startDate);
    searchParams.append("endDate", params.endDate);
    searchParams.append("format", format);

    return apiGet(
      `/api/${tenant}/finance/reports/export/${reportType}?${searchParams.toString()}`
    );
  },
};
