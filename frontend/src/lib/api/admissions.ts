import {
  apiGetClientNew,
  apiPostClientNew,
  apiPutClient,
  apiDeleteClient,
  apiGet,
} from "@/lib/utils";

// TypeScript interfaces for admission management

export interface AdmissionReview {
  id: string;
  applicationId: string;
  reviewerId: string;
  status: "PENDING" | "IN_REVIEW" | "COMPLETED" | "APPROVED" | "REJECTED";
  interviewNotes?: string;
  academicScore?: number;
  recommendations?: string;
  decision?: string;
  decisionReason?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  application?: {
    id: string;
    studentName: string;
    studentEmail: string;
    course: string;
    status: string;
    submittedAt: string;
  };
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface OfferLetterTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  content: Record<string, unknown>;
  variables: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    offerLetters: number;
  };
}

export interface OfferLetter {
  id: string;
  applicationId: string;
  templateId?: string;
  content: Record<string, unknown>;
  status: "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  generatedBy: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  declinedAt?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  application?: {
    id: string;
    studentName: string;
    studentEmail: string;
    course: string;
  };
  template?: {
    id: string;
    name: string;
  };
  generator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Application {
  id: string;
  tenantId: string;
  leadId?: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  course?: string;
  status:
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "DOCUMENTS_PENDING"
    | "DOCUMENTS_VERIFIED"
    | "PAYMENT_PENDING"
    | "PAYMENT_COMPLETED"
    | "ADMITTED"
    | "REJECTED"
    | "ENROLLED";
  assigneeId?: string;
  submittedAt: string;
  updatedAt: string;
  admissionReview?: AdmissionReview;
  offerLetter?: OfferLetter;
  documents?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: string;
    createdAt: string;
    verifiedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    verifier?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  appointments?: Array<{
    id: string;
    scheduledAt: string;
    duration: number;
    status: string;
    notes?: string;
  }>;
  lead?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    source: string;
    notes: Array<{
      id: string;
      content: string;
      createdAt: string;
    }>;
  };
}

export interface Appointment {
  id: string;
  tenantId: string;
  applicationId?: string;
  assigneeId: string;
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  scheduledAt: string;
  duration: number;
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  application?: {
    id: string;
    studentName: string;
    course: string;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Communication {
  id: string;
  tenantId: string;
  applicationId?: string;
  type: "EMAIL" | "SMS" | "WHATSAPP";
  subject?: string;
  content: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "FAILED";
  senderId: string;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface AdmissionDashboardStats {
  totalApplications: number;
  pendingReviews: number;
  completedReviews: number;
  todayAppointments: number;
}

export interface AdmissionHeadStats {
  totalApplications: number;
  pendingApprovals: number;
  approvedApplications: number;
  rejectedApplications: number;
  offerLettersGenerated: number;
  offerLettersSent: number;
  offerLettersAccepted: number;
  conversionRate: number;
  offerAcceptanceRate: number;
}

export interface ApplicationProgressStep {
  name: string;
  completed: boolean;
  date?: string;
}

// API Functions for Admission Team

export async function getAdmissionTeamDashboard(
  tenantSlug: string,
  token: string | undefined
) {
  return apiGet<{
    stats: AdmissionDashboardStats;
    recentReviews: AdmissionReview[];
  }>(`/${tenantSlug}/admission-team/dashboard`, { token: token });
}

export async function getApplicationsForReview(
  tenantSlug: string,
  token: string | undefined,
  filters: {
    status?: string;
    course?: string;
    page?: number;
    limit?: number;
  } = {}
) {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.course) params.append("course", filters.course);
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());

  const queryString = params.toString();
  const url = `/${tenantSlug}/admission-team/applications${
    queryString ? `?${queryString}` : ""
  }`;

  return apiGet<{
    applications: Application[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>(url, { token: token });
}

export async function getApplicationDetails(
  tenantSlug: string,
  applicationId: string,
  token: string | undefined
) {
  return apiGet<Application>(
    `/${tenantSlug}/admission-team/applications/${applicationId}`,
    { token: token }
  );
}

// export async function submitAdmissionReview(
//   tenantSlug: string,
//   applicationId: string,
//   data: {
//     interviewNotes?: string;
//     academicScore?: number;
//     recommendations?: string;
//     decision?: "APPROVED" | "REJECTED" | "WAITLISTED";
//     decisionReason?: string;
//   }
// ) {
//   return apiPostClientNew<AdmissionReview>(
//     `/${tenantSlug}/admission-team/applications/${applicationId}/review`,
//     data,
//     { token: true }
//   );
// }

export async function getApplicationCommunications(
  tenantSlug: string,
  applicationId: string,
  token: string | undefined
) {
  return apiGet<Communication[]>(
    `/${tenantSlug}/admission-team/communications/${applicationId}`,
    { token: token }
  );
}

export async function sendBulkCommunications(
  tenantSlug: string,
  data: {
    applicationIds: string[];
    type: "EMAIL" | "SMS" | "WHATSAPP";
    subject?: string;
    message: string;
    templateId?: string;
  }
) {
  return apiPostClientNew<{
    message: string;
    communications: Communication[];
  }>(`/${tenantSlug}/admission-team/communications/bulk`, data, {
    token: true,
  });
}

export async function getCounselingAppointments(
  tenantSlug: string,
  token: string | undefined,
  filters: {
    date?: string;
    status?: string;
  } = {}
) {
  const params = new URLSearchParams();
  if (filters.date) params.append("date", filters.date);
  if (filters.status) params.append("status", filters.status);

  const queryString = params.toString();
  const url = `/${tenantSlug}/admission-team/appointments${
    queryString ? `?${queryString}` : ""
  }`;

  return apiGet<Appointment[]>(url, { token: token });
}

export async function scheduleAppointment(
  tenantSlug: string,
  data: {
    applicationId: string;
    studentName: string;
    studentEmail?: string;
    studentPhone?: string;
    scheduledAt: string;
    duration?: number;
    notes?: string;
  }
) {
  return apiPostClientNew<Appointment>(
    `/${tenantSlug}/admission-team/appointments`,
    data,
    { token: true }
  );
}

export async function updateAppointment(
  tenantSlug: string,
  appointmentId: string,
  data: {
    scheduledAt?: string;
    duration?: number;
    status?: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
    notes?: string;
  }
) {
  return apiPutClient<Appointment>(
    `/${tenantSlug}/admission-team/appointments/${appointmentId}`,
    data,
    { token: true }
  );
}

// API Functions for Admission Head

export async function getAdmissionHeadDashboard(tenantSlug: string) {
  return apiGetClientNew<{
    stats: AdmissionHeadStats;
    teamPerformance: Array<{
      reviewerId: string;
      _count: { id: number };
      _avg: { academicScore: number | null };
    }>;
  }>(`/${tenantSlug}/admission-head/dashboard`, { token: true });
}

export async function getAdmissionReports(
  tenantSlug: string,
  filters: {
    period?: "7d" | "30d" | "90d" | "1y";
    type?: "summary" | "detailed";
  } = {}
) {
  const params = new URLSearchParams();
  if (filters.period) params.append("period", filters.period);
  if (filters.type) params.append("type", filters.type);

  const queryString = params.toString();
  const url = `/${tenantSlug}/admission-head/reports${
    queryString ? `?${queryString}` : ""
  }`;

  return apiGetClientNew<any>(url, { token: true });
}

export async function getOfferLetterTemplates(
  tenantSlug: string,
  active?: boolean
) {
  const params = new URLSearchParams();
  if (active !== undefined) params.append("active", active.toString());

  const queryString = params.toString();
  const url = `/${tenantSlug}/admission-head/templates${
    queryString ? `?${queryString}` : ""
  }`;

  return apiGetClientNew<OfferLetterTemplate[]>(url, { token: true });
}

export async function createOfferLetterTemplate(
  tenantSlug: string,
  data: {
    name: string;
    description?: string;
    content: Record<string, unknown>;
    variables: Record<string, unknown>;
    isActive?: boolean;
  }
) {
  return apiPostClientNew<OfferLetterTemplate>(
    `/${tenantSlug}/admission-head/templates`,
    data,
    { token: true }
  );
}

export async function updateOfferLetterTemplate(
  tenantSlug: string,
  templateId: string,
  data: {
    name?: string;
    description?: string;
    content?: Record<string, unknown>;
    variables?: Record<string, unknown>;
    isActive?: boolean;
  }
) {
  return apiPutClient<OfferLetterTemplate>(
    `/${tenantSlug}/admission-head/templates/${templateId}`,
    data,
    { token: true }
  );
}

export async function deleteOfferLetterTemplate(
  tenantSlug: string,
  templateId: string
) {
  return apiDeleteClient<{ message: string }>(
    `/${tenantSlug}/admission-head/templates/${templateId}`,
    { token: true }
  );
}

export async function generateOfferLetter(
  tenantSlug: string,
  data: {
    applicationId: string;
    templateId?: string;
    customContent?: Record<string, unknown>;
  }
) {
  return apiPostClientNew<OfferLetter>(
    `/${tenantSlug}/admission-head/offers/generate`,
    data,
    { token: true }
  );
}

export async function bulkGenerateOffers(
  tenantSlug: string,
  data: {
    applicationIds: string[];
    templateId?: string;
  }
) {
  return apiPostClientNew<{
    message: string;
    offerLetters: OfferLetter[];
  }>(`/${tenantSlug}/admission-head/offers/bulk-generate`, data, {
    token: true,
  });
}

export async function distributeOfferLetters(
  tenantSlug: string,
  data: {
    offerLetterIds: string[];
    channels: ("EMAIL" | "SMS" | "WHATSAPP")[];
    subject?: string;
    message?: string;
  }
) {
  return apiPostClientNew<{
    message: string;
    results: Array<{
      offerLetter: OfferLetter;
      communications: Communication[];
    }>;
  }>(`/${tenantSlug}/admission-head/offers/distribute`, data, { token: true });
}

export async function getPendingApprovals(tenantSlug: string, status?: string) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);

  const queryString = params.toString();
  const url = `/${tenantSlug}/admission-head/approvals${
    queryString ? `?${queryString}` : ""
  }`;

  return apiGetClientNew<AdmissionReview[]>(url, { token: true });
}

// API Functions for Student Portal

export async function getStudentApplication(
  tenantSlug: string,
  applicationId: string
) {
  return apiGetClientNew<
    Application & {
      progressSteps: ApplicationProgressStep[];
    }
  >(`/${tenantSlug}/student/application/${applicationId}`, { token: true });
}

export async function getStudentDocuments(
  tenantSlug: string,
  applicationId: string
) {
  return apiGetClientNew<
    Array<{
      id: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      status: string;
      createdAt: string;
      verifiedAt?: string;
      rejectedAt?: string;
      rejectionReason?: string;
      verifier?: {
        id: string;
        firstName: string;
        lastName: string;
      };
    }>
  >(`/${tenantSlug}/student/documents/${applicationId}`, { token: true });
}

export async function uploadStudentDocument(
  tenantSlug: string,
  data: {
    applicationId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
  }
) {
  return apiPostClientNew<{
    id: string;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    status: string;
    createdAt: string;
  }>(`/${tenantSlug}/student/documents`, data, { token: true });
}

export async function getStudentPayments(
  tenantSlug: string,
  applicationId: string
) {
  return apiGetClientNew<{
    payments: Array<{
      id: string;
      amount: number;
      platformFee: number;
      institutionAmount: number;
      status: string;
      gatewayTransactionId?: string;
      createdAt: string;
      updatedAt: string;
    }>;
    summary: {
      totalPaid: number;
      totalPending: number;
      totalTransactions: number;
    };
  }>(`/${tenantSlug}/student/payments/${applicationId}`, { token: true });
}

export async function getStudentCommunications(
  tenantSlug: string,
  applicationId: string
) {
  return apiGetClientNew<{
    communications: Communication[];
    groupedCommunications: Record<string, Communication[]>;
    totalCount: number;
  }>(`/${tenantSlug}/student/communications/${applicationId}`, { token: true });
}

export async function createRefundRequest(
  tenantSlug: string,
  data: {
    applicationId: string;
    paymentId?: string;
    amount: number;
    reason: string;
    description?: string;
  }
) {
  return apiPostClientNew<{
    id: string;
    applicationId: string;
    paymentId?: string;
    studentName: string;
    studentEmail?: string;
    studentPhone?: string;
    amount: number;
    reason: string;
    status: string;
    requestedAt: string;
    createdAt: string;
  }>(`/${tenantSlug}/student/refund-request`, data, { token: true });
}

export async function getStudentOfferLetter(
  tenantSlug: string,
  applicationId: string
) {
  return apiGetClientNew<OfferLetter>(
    `/${tenantSlug}/student/offer-letter/${applicationId}`,
    { token: true }
  );
}

export async function acceptOfferLetter(
  tenantSlug: string,
  applicationId: string
) {
  return apiPostClientNew<OfferLetter>(
    `/${tenantSlug}/student/offer-letter/${applicationId}/accept`,
    {},
    { token: true }
  );
}

export async function declineOfferLetter(
  tenantSlug: string,
  applicationId: string,
  reason?: string
) {
  return apiPostClientNew<OfferLetter>(
    `/${tenantSlug}/student/offer-letter/${applicationId}/decline`,
    { reason },
    { token: true }
  );
}
