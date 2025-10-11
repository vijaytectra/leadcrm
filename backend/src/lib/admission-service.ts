import { prisma } from "./prisma";

/**
 * Generate offer letter content from template
 */
export async function generateOfferLetterContent(
  templateContent: Record<string, unknown>,
  variables: Record<string, unknown>
): Promise<Record<string, unknown>> {
  // This would integrate with a rich text editor or template engine
  // For now, we'll return a simple object structure
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Offer Letter" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Dear " },
          {
            type: "text",
            text: variables.studentName as string,
            marks: [{ type: "bold" }],
          },
          { type: "text", text: "," },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Congratulations! We are pleased to offer you admission to our ",
          },
          {
            type: "text",
            text: variables.course as string,
            marks: [{ type: "bold" }],
          },
          { type: "text", text: " program." },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Your program will begin on " },
          {
            type: "text",
            text: variables.programStartDate as string,
            marks: [{ type: "bold" }],
          },
          { type: "text", text: " and the total fee is " },
          {
            type: "text",
            text: variables.feeAmount as string,
            marks: [{ type: "bold" }],
          },
          { type: "text", text: " per year." },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Please confirm your acceptance by " },
          {
            type: "text",
            text: variables.deadline as string,
            marks: [{ type: "bold" }],
          },
          { type: "text", text: "." },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "We look forward to welcoming you to " },
          {
            type: "text",
            text: variables.institutionName as string,
            marks: [{ type: "bold" }],
          },
          { type: "text", text: "." },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Best regards," },
          { type: "text", text: "Admissions Team" },
        ],
      },
    ],
  };
}

/**
 * Send offer letter via multiple channels
 */
export async function sendOfferLetter(
  offerLetterId: string,
  channels: string[],
  subject?: string,
  message?: string
): Promise<void> {
  const offerLetter = await prisma.offerLetter.findUnique({
    where: { id: offerLetterId },
    include: {
      application: {
        select: {
          id: true,
          studentName: true,
          studentEmail: true,
          studentPhone: true,
        },
      },
    },
  });

  if (!offerLetter) {
    throw new Error("Offer letter not found");
  }

  // Create communications for each channel
  const communications = await Promise.all(
    channels.map((channel) =>
      prisma.communication.create({
        data: {
          tenantId: offerLetter.tenantId,
          applicationId: offerLetter.applicationId,
          type: channel as "EMAIL" | "SMS" | "WHATSAPP",
          subject: subject || "Offer Letter",
          content: message || "Your offer letter is ready for review.",
          status: "SENT",
        },
      })
    )
  );

  // Update offer letter status
  await prisma.offerLetter.update({
    where: { id: offerLetterId },
    data: {
      status: "SENT",
      sentAt: new Date(),
    },
  });

  // Here you would integrate with actual email/SMS/WhatsApp services
  console.log("Offer letter sent via channels:", channels);
  console.log("Communications created:", communications.length);
}

/**
 * Aggregate communication logs for an application
 */
export async function aggregateCommunicationLogs(applicationId: string) {
  const communications = await prisma.communication.findMany({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  // Group by type
  const groupedByType = communications.reduce((acc, comm) => {
    if (!acc[comm.type]) {
      acc[comm.type] = [];
    }
    acc[comm.type].push(comm);
    return acc;
  }, {} as Record<string, typeof communications>);

  // Calculate statistics
  const stats = {
    total: communications.length,
    byType: Object.keys(groupedByType).reduce((acc, type) => {
      acc[type] = groupedByType[type].length;
      return acc;
    }, {} as Record<string, number>),
    byStatus: communications.reduce((acc, comm) => {
      acc[comm.status] = (acc[comm.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return {
    communications,
    groupedByType,
    stats,
  };
}

/**
 * Calculate admission metrics for dashboard
 */
export async function calculateAdmissionMetrics(
  tenantId: string,
  period?: { start: Date; end: Date }
) {
  const whereClause: any = { tenantId };

  if (period) {
    whereClause.submittedAt = {
      gte: period.start,
      lte: period.end,
    };
  }

  const [
    totalApplications,
    applicationsByStatus,
    applicationsByCourse,
    admissionReviews,
    offerLetters,
  ] = await Promise.all([
    prisma.application.count({ where: whereClause }),
    prisma.application.groupBy({
      by: ["status"],
      where: whereClause,
      _count: { id: true },
    }),
    prisma.application.groupBy({
      by: ["course"],
      where: whereClause,
      _count: { id: true },
    }),
    prisma.admissionReview.findMany({
      where: { tenantId },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
    prisma.offerLetter.findMany({
      where: { tenantId },
    }),
  ]);

  // Calculate conversion rates
  const approvedApplications =
    applicationsByStatus.find((item) => item.status === "ADMITTED")?._count
      .id || 0;

  const conversionRate =
    totalApplications > 0
      ? Math.round((approvedApplications / totalApplications) * 100)
      : 0;

  // Calculate offer letter metrics
  const offerLettersSent = offerLetters.filter((offer) =>
    ["SENT", "VIEWED", "ACCEPTED", "DECLINED"].includes(offer.status)
  ).length;

  const offerLettersAccepted = offerLetters.filter(
    (offer) => offer.status === "ACCEPTED"
  ).length;

  const offerAcceptanceRate =
    offerLettersSent > 0
      ? Math.round((offerLettersAccepted / offerLettersSent) * 100)
      : 0;

  // Team performance
  const teamPerformance = admissionReviews.reduce((acc, review) => {
    const reviewerId = review.reviewerId;
    if (!acc[reviewerId]) {
      acc[reviewerId] = {
        reviewer: review.reviewer,
        reviews: 0,
        totalScore: 0,
        averageScore: 0,
      };
    }
    acc[reviewerId].reviews += 1;
    if (review.academicScore) {
      acc[reviewerId].totalScore += review.academicScore;
    }
    return acc;
  }, {} as Record<string, any>);

  // Calculate average scores
  Object.keys(teamPerformance).forEach((reviewerId) => {
    const reviewer = teamPerformance[reviewerId];
    if (reviewer.reviews > 0) {
      reviewer.averageScore = Math.round(
        reviewer.totalScore / reviewer.reviews
      );
    }
  });

  return {
    totalApplications,
    applicationsByStatus,
    applicationsByCourse,
    conversionRate,
    offerLettersGenerated: offerLetters.length,
    offerLettersSent,
    offerLettersAccepted,
    offerAcceptanceRate,
    teamPerformance: Object.values(teamPerformance),
    admissionReviews,
  };
}

/**
 * Generate admission reports
 */
export async function generateAdmissionReport(
  tenantId: string,
  period: { start: Date; end: Date },
  type: "summary" | "detailed" = "summary"
) {
  const applications = await prisma.application.findMany({
    where: {
      tenantId,
      submittedAt: {
        gte: period.start,
        lte: period.end,
      },
    },
    include: {
      admissionReview: {
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      offerLetter: true,
      payments: {
        select: {
          amount: true,
          status: true,
        },
      },
    },
  });

  if (type === "summary") {
    // Generate summary statistics
    const applicationsByStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const applicationsByCourse = applications.reduce((acc, app) => {
      const course = app.course || "Not specified";
      acc[course] = (acc[course] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyApplications = applications.reduce((acc, app) => {
      const month = new Date(app.submittedAt).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      period,
      applicationsByStatus,
      applicationsByCourse,
      monthlyApplications,
      totalApplications: applications.length,
    };
  } else {
    // Return detailed application data
    return {
      period,
      applications,
      totalApplications: applications.length,
    };
  }
}

/**
 * Validate admission review data
 */
export function validateAdmissionReview(data: {
  interviewNotes?: string;
  academicScore?: number;
  recommendations?: string;
  decision?: string;
  decisionReason?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.academicScore !== undefined) {
    if (data.academicScore < 0 || data.academicScore > 100) {
      errors.push("Academic score must be between 0 and 100");
    }
  }

  if (
    data.decision &&
    !["APPROVED", "REJECTED", "WAITLISTED"].includes(data.decision)
  ) {
    errors.push("Decision must be APPROVED, REJECTED, or WAITLISTED");
  }

  if (data.decision === "REJECTED" && !data.decisionReason) {
    errors.push("Decision reason is required when rejecting an application");
  }

  if (data.interviewNotes && data.interviewNotes.length > 1000) {
    errors.push("Interview notes must be less than 1000 characters");
  }

  if (data.recommendations && data.recommendations.length > 1000) {
    errors.push("Recommendations must be less than 1000 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get application priority score
 */
export function getApplicationPriorityScore(application: {
  submittedAt: string;
  status: string;
  admissionReview?: {
    academicScore?: number;
    decision?: string;
  };
}): number {
  let score = 0;

  // Time-based priority (older applications get higher priority)
  const daysSinceApplication = Math.floor(
    (Date.now() - new Date(application.submittedAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  score += Math.min(daysSinceApplication * 2, 50);

  // Status-based priority
  switch (application.status) {
    case "SUBMITTED":
      score += 30;
      break;
    case "UNDER_REVIEW":
      score += 20;
      break;
    case "DOCUMENTS_VERIFIED":
      score += 40;
      break;
    case "PAYMENT_COMPLETED":
      score += 50;
      break;
    default:
      score += 10;
  }

  // Academic score priority
  if (application.admissionReview?.academicScore) {
    score += application.admissionReview.academicScore * 0.3;
  }

  // Decision priority
  if (application.admissionReview?.decision === "APPROVED") {
    score += 100;
  } else if (application.admissionReview?.decision === "REJECTED") {
    score = 0;
  }

  return Math.round(score);
}

/**
 * Format application data for export
 */
export function formatApplicationForExport(application: any) {
  return {
    "Application ID": application.id,
    "Student Name": application.studentName,
    Email: application.studentEmail || "",
    Phone: application.studentPhone || "",
    Course: application.course || "",
    Status: application.status,
    "Submitted Date": new Date(application.submittedAt).toLocaleDateString(),
    "Academic Score": application.admissionReview?.academicScore || "",
    Decision: application.admissionReview?.decision || "",
    "Documents Count": application.documents?.length || 0,
    "Payments Count": application.payments?.length || 0,
    "Total Paid":
      application.payments
        ?.filter((p: any) => p.status === "COMPLETED")
        .reduce((sum: number, p: any) => sum + p.amount, 0) || 0,
  };
}
