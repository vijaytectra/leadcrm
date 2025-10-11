// Document API types and functions

export interface Document {
  id: string;
  tenantId: string;
  applicationId?: string;
  documentTypeId?: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  status: "UPLOADED" | "VERIFIED" | "REJECTED";
  uploadedAt: string;
  verifiedAt?: string;
  rejectedAt?: string;
  verifierId?: string;
  rejectionReason?: string;
  documentType?: DocumentType;
  application?: {
    id: string;
    studentName: string;
    studentEmail: string;
  };
  verifier?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface DocumentType {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  category: "GENERAL" | "ACADEMIC" | "IDENTITY" | "FINANCIAL";
  isRequired: boolean;
  maxFileSize: number;
  allowedFormats: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  checklists?: DocumentChecklist[];
}

export interface DocumentChecklist {
  id: string;
  documentTypeId: string;
  title: string;
  description?: string;
  isRequired: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUploadRequest {
  applicationId?: string;
  documentTypeId?: string;
  description?: string;
}

export interface DocumentVerificationRequest {
  status: "VERIFIED" | "REJECTED";
  comments?: string;
  rejectionReason?: string;
}

export interface BatchVerificationRequest {
  documentIds: string[];
  status: "VERIFIED" | "REJECTED";
  comments?: string;
  rejectionReason?: string;
}

export interface DocumentQueueResponse {
  documents: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API Functions using existing utils
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/utils";

export const documentApi = {
  // Upload single document
  uploadDocument: async (tenant: string, formData: FormData) => {
    return apiPost(`/api/${tenant}/documents/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Upload multiple documents
  uploadMultipleDocuments: async (tenant: string, formData: FormData) => {
    return apiPost(`/api/${tenant}/documents/upload-multiple`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Get document queue
  getDocumentQueue: async (
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
    return apiGet(`/api/${tenant}/documents/queue${query ? `?${query}` : ""}`);
  },

  // Get document details
  getDocument: async (tenant: string, documentId: string) => {
    return apiGet(`/api/${tenant}/documents/${documentId}`);
  },

  // Verify document
  verifyDocument: async (
    tenant: string,
    documentId: string,
    data: DocumentVerificationRequest
  ) => {
    return apiPost(`/api/${tenant}/documents/${documentId}/verify`, data);
  },

  // Batch verify documents
  batchVerifyDocuments: async (
    tenant: string,
    data: BatchVerificationRequest
  ) => {
    return apiPost(`/api/${tenant}/documents/batch-verify`, data);
  },

  // Delete document
  deleteDocument: async (tenant: string, documentId: string) => {
    return apiDelete(`/api/${tenant}/documents/${documentId}`);
  },

  // Document Types
  getDocumentTypes: async (tenant: string) => {
    return apiGet(`/api/${tenant}/document-types`);
  },

  createDocumentType: async (
    tenant: string,
    data: Omit<DocumentType, "id" | "tenantId" | "createdAt" | "updatedAt">
  ) => {
    return apiPost(`/api/${tenant}/document-types`, data);
  },

  updateDocumentType: async (
    tenant: string,
    documentTypeId: string,
    data: Partial<DocumentType>
  ) => {
    return apiPut(`/api/${tenant}/document-types/${documentTypeId}`, data);
  },

  deleteDocumentType: async (tenant: string, documentTypeId: string) => {
    return apiDelete(`/api/${tenant}/document-types/${documentTypeId}`);
  },
};
