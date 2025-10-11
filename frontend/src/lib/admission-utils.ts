import {
  Application,
  AdmissionReview,
  OfferLetter,
} from "@/lib/api/admissions";

/**
 * Format application status for display
 */
export function formatApplicationStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Get color class for application status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "SUBMITTED":
      return "bg-blue-100 text-blue-800";
    case "UNDER_REVIEW":
      return "bg-yellow-100 text-yellow-800";
    case "DOCUMENTS_VERIFIED":
      return "bg-green-100 text-green-800";
    case "PAYMENT_COMPLETED":
      return "bg-purple-100 text-purple-800";
    case "ADMITTED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "ENROLLED":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Get icon for application status
 */
export function getStatusIcon(status: string): string {
  switch (status) {
    case "SUBMITTED":
      return "📄";
    case "UNDER_REVIEW":
      return "⏳";
    case "DOCUMENTS_VERIFIED":
      return "✅";
    case "PAYMENT_COMPLETED":
      return "💳";
    case "ADMITTED":
      return "🎉";
    case "REJECTED":
      return "❌";
    case "ENROLLED":
      return "🎓";
    default:
      return "📋";
  }
}

/**
 * Calculate application progress percentage
 */
export function calculateApplicationProgress(application: Application): number {
  const steps = [
    application.status === "SUBMITTED",
    (application.documents?.length || 0) > 0,
    application.documents?.every((doc) => doc.status === "VERIFIED") || false,
    application.payments?.some((p) => p.status === "COMPLETED") || false,
    application.status === "UNDER_REVIEW",
    application.status === "ADMITTED" || application.status === "REJECTED",
    !!application.offerLetter,
    application.status === "ENROLLED",
  ];

  const completedSteps = steps.filter(Boolean).length;
  return Math.round((completedSteps / steps.length) * 100);
}

/**
 * Get progress steps for application
 */
export function getApplicationProgressSteps(application: Application) {
  return [
    {
      name: "Application Submitted",
      completed: application.status === "SUBMITTED",
      date: application.submittedAt,
    },
    {
      name: "Documents Uploaded",
      completed: (application.documents?.length || 0) > 0,
      date: application.documents?.[0]?.createdAt,
    },
    {
      name: "Documents Verified",
      completed:
        application.documents?.every((doc) => doc.status === "VERIFIED") ||
        false,
      date: application.documents?.find((doc) => doc.status === "VERIFIED")
        ?.verifiedAt,
    },
    {
      name: "Payment Completed",
      completed:
        application.payments?.some((p) => p.status === "COMPLETED") || false,
      date: application.payments?.find((p) => p.status === "COMPLETED")
        ?.createdAt,
    },
    {
      name: "Under Review",
      completed: application.status === "UNDER_REVIEW",
      date:
        application.status === "UNDER_REVIEW" ? application.updatedAt : null,
    },
    {
      name: "Admission Decision",
      completed:
        application.status === "ADMITTED" || application.status === "REJECTED",
      date:
        application.status === "ADMITTED" || application.status === "REJECTED"
          ? application.updatedAt
          : null,
    },
    {
      name: "Offer Letter",
      completed: !!application.offerLetter,
      date: application.offerLetter?.createdAt,
    },
    {
      name: "Enrolled",
      completed: application.status === "ENROLLED",
      date: application.status === "ENROLLED" ? application.updatedAt : null,
    },
  ];
}

/**
 * Format offer letter variables for template
 */
export function formatOfferLetterVariables(
  application: Application,
  additionalData?: Record<string, unknown>
) {
  return {
    studentName: application.studentName,
    course: application.course || "Not specified",
    institutionName: "Your Institution Name", // This should come from tenant data
    programStartDate: "August 15, 2024", // This should be configurable
    feeAmount: "₹2,50,000", // This should come from fee structure
    deadline: "July 30, 2024", // This should be configurable
    applicationId: application.id,
    studentEmail: application.studentEmail || "",
    studentPhone: application.studentPhone || "",
    parentName: application.parentName || "",
    parentEmail: application.parentEmail || "",
    parentPhone: application.parentPhone || "",
    ...additionalData,
  };
}

/**
 * Get review status color
 */
export function getReviewStatusColor(status: string): string {
  switch (status) {
    case "PENDING":
      return "bg-gray-100 text-gray-800";
    case "IN_REVIEW":
      return "bg-yellow-100 text-yellow-800";
    case "COMPLETED":
      return "bg-blue-100 text-blue-800";
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Get offer letter status color
 */
export function getOfferLetterStatusColor(status: string): string {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-800";
    case "SENT":
      return "bg-blue-100 text-blue-800";
    case "VIEWED":
      return "bg-yellow-100 text-yellow-800";
    case "ACCEPTED":
      return "bg-green-100 text-green-800";
    case "DECLINED":
      return "bg-red-100 text-red-800";
    case "EXPIRED":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Calculate days since application
 */
export function getDaysSinceApplication(submittedAt: string): number {
  const submitted = new Date(submittedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - submitted.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get application priority based on status and time
 */
export function getApplicationPriority(
  application: Application
): "high" | "medium" | "low" {
  const daysSinceApplication = getDaysSinceApplication(application.submittedAt);

  if (application.status === "REJECTED") return "low";
  if (application.status === "ENROLLED") return "low";
  if (application.status === "ADMITTED") return "medium";
  if (daysSinceApplication > 30) return "high";
  if (application.status === "UNDER_REVIEW" && daysSinceApplication > 14)
    return "high";
  if (application.status === "SUBMITTED" && daysSinceApplication > 7)
    return "medium";

  return "low";
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string = "INR"
): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get communication type icon
 */
export function getCommunicationTypeIcon(type: string): string {
  switch (type) {
    case "EMAIL":
      return "📧";
    case "SMS":
      return "📱";
    case "WHATSAPP":
      return "💬";
    default:
      return "📨";
  }
}

/**
 * Get communication status color
 */
export function getCommunicationStatusColor(status: string): string {
  switch (status) {
    case "SENT":
      return "bg-green-100 text-green-800";
    case "DELIVERED":
      return "bg-blue-100 text-blue-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Calculate admission metrics
 */
export function calculateAdmissionMetrics(applications: Application[]) {
  const total = applications.length;
  const submitted = applications.filter(
    (app) => app.status === "SUBMITTED"
  ).length;
  const underReview = applications.filter(
    (app) => app.status === "UNDER_REVIEW"
  ).length;
  const admitted = applications.filter(
    (app) => app.status === "ADMITTED"
  ).length;
  const rejected = applications.filter(
    (app) => app.status === "REJECTED"
  ).length;
  const enrolled = applications.filter(
    (app) => app.status === "ENROLLED"
  ).length;

  return {
    total,
    submitted,
    underReview,
    admitted,
    rejected,
    enrolled,
    conversionRate: total > 0 ? Math.round((admitted / total) * 100) : 0,
    enrollmentRate: admitted > 0 ? Math.round((enrolled / admitted) * 100) : 0,
  };
}

/**
 * Get time ago string
 */
export function getTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Get file type icon
 */
export function getFileTypeIcon(fileType: string): string {
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return "📄";
  if (type.includes("image")) return "🖼️";
  if (type.includes("word")) return "📝";
  if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
  if (type.includes("powerpoint") || type.includes("presentation")) return "📊";
  return "📎";
}
