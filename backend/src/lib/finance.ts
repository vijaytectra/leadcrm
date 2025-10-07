import { prisma } from "./prisma";

export interface FeeCalculationInput {
  amount: number;
  tenantId: string;
  paymentType: "SUBSCRIPTION" | "TRANSACTION" | "FORM_PAYMENT";
  customFeeStructure?: any;
}

export interface FeeCalculationResult {
  totalAmount: number;
  platformFee: number;
  institutionAmount: number;
  feeBreakdown: {
    baseAmount: number;
    platformFeePercentage: number;
    platformFeeFixed: number;
    discounts: number;
    taxes: number;
  };
}

export interface RevenueSplitResult {
  platformRevenue: number;
  institutionRevenue: number;
  splitBreakdown: {
    grossAmount: number;
    platformFee: number;
    processingFee: number;
    netInstitutionAmount: number;
  };
}

/**
 * Calculate platform fees based on tenant subscription and payment type
 */
export async function calculatePlatformFee(
  input: FeeCalculationInput
): Promise<FeeCalculationResult> {
  const { amount, tenantId, paymentType, customFeeStructure } = input;

  // Get tenant subscription details
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
    },
  });

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  // Default fee structure
  const defaultFeeStructure = {
    STARTER: {
      platformFeePercentage: 2.5, // 2.5%
      platformFeeFixed: 50, // ₹50 minimum
      processingFeePercentage: 1.0, // 1% processing fee
    },
    PRO: {
      platformFeePercentage: 2.0, // 2%
      platformFeeFixed: 50, // ₹50 minimum
      processingFeePercentage: 0.8, // 0.8% processing fee
    },
    MAX: {
      platformFeePercentage: 1.5, // 1.5%
      platformFeeFixed: 50, // ₹50 minimum
      processingFeePercentage: 0.5, // 0.5% processing fee
    },
  };

  // Use custom fee structure if provided, otherwise use default
  const feeStructure =
    customFeeStructure || defaultFeeStructure[tenant.subscriptionTier];

  // Calculate platform fee
  const percentageFee = (amount * feeStructure.platformFeePercentage) / 100;
  const platformFee = Math.max(percentageFee, feeStructure.platformFeeFixed);

  // Calculate processing fee
  const processingFee = (amount * feeStructure.processingFeePercentage) / 100;

  // Calculate total fees
  const totalFees = platformFee + processingFee;
  const institutionAmount = amount - totalFees;

  return {
    totalAmount: amount,
    platformFee: Math.round(platformFee),
    institutionAmount: Math.round(institutionAmount),
    feeBreakdown: {
      baseAmount: amount,
      platformFeePercentage: feeStructure.platformFeePercentage,
      platformFeeFixed: feeStructure.platformFeeFixed,
      discounts: 0, // Can be extended for discount logic
      taxes: 0, // Can be extended for tax calculations
    },
  };
}

/**
 * Calculate revenue split between platform and institution
 */
export async function calculateRevenueSplit(
  amount: number,
  tenantId: string,
  paymentType: "SUBSCRIPTION" | "TRANSACTION" | "FORM_PAYMENT" = "TRANSACTION"
): Promise<RevenueSplitResult> {
  const feeCalculation = await calculatePlatformFee({
    amount,
    tenantId,
    paymentType,
  });

  return {
    platformRevenue: feeCalculation.platformFee,
    institutionRevenue: feeCalculation.institutionAmount,
    splitBreakdown: {
      grossAmount: amount,
      platformFee: feeCalculation.platformFee,
      processingFee:
        amount - feeCalculation.platformFee - feeCalculation.institutionAmount,
      netInstitutionAmount: feeCalculation.institutionAmount,
    },
  };
}

/**
 * Get financial metrics for a tenant
 */
export async function getTenantFinancialMetrics(
  tenantId: string,
  period: string = "30d"
) {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get payment statistics
  const paymentStats = await prisma.payment.aggregate({
    where: {
      tenantId,
      createdAt: { gte: startDate },
    },
    _sum: {
      amount: true,
      platformFee: true,
      institutionAmount: true,
    },
    _count: {
      id: true,
    },
  });

  // Get successful payments
  const successfulPayments = await prisma.payment.aggregate({
    where: {
      tenantId,
      status: "COMPLETED",
      createdAt: { gte: startDate },
    },
    _sum: {
      amount: true,
      platformFee: true,
      institutionAmount: true,
    },
    _count: {
      id: true,
    },
  });

  // Get failed payments
  const failedPayments = await prisma.payment.aggregate({
    where: {
      tenantId,
      status: "FAILED",
      createdAt: { gte: startDate },
    },
    _count: {
      id: true,
    },
  });

  // Get refunds
  const refunds = await prisma.payment.aggregate({
    where: {
      tenantId,
      status: "REFUNDED",
      createdAt: { gte: startDate },
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    period,
    dateRange: {
      start: startDate,
      end: now,
    },
    metrics: {
      totalTransactions: paymentStats._count.id || 0,
      totalAmount: paymentStats._sum.amount || 0,
      totalPlatformFees: paymentStats._sum.platformFee || 0,
      totalInstitutionAmount: paymentStats._sum.institutionAmount || 0,
      successfulTransactions: successfulPayments._count.id || 0,
      successfulAmount: successfulPayments._sum.amount || 0,
      failedTransactions: failedPayments._count.id || 0,
      refundedAmount: refunds._sum.amount || 0,
      refundedTransactions: refunds._count.id || 0,
    },
    conversion: {
      successRate:
        paymentStats._count.id > 0
          ? ((successfulPayments._count.id || 0) / paymentStats._count.id) * 100
          : 0,
      averageTransactionValue:
        successfulPayments._count.id > 0
          ? (successfulPayments._sum.amount || 0) / successfulPayments._count.id
          : 0,
    },
  };
}

/**
 * Get platform-wide financial metrics
 */
export async function getPlatformFinancialMetrics(period: string = "30d") {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get platform-wide payment statistics
  const platformStats = await prisma.payment.aggregate({
    where: {
      status: "COMPLETED",
      createdAt: { gte: startDate },
    },
    _sum: {
      amount: true,
      platformFee: true,
      institutionAmount: true,
    },
    _count: {
      id: true,
    },
  });

  // Get revenue by subscription tier
  const revenueByTier = await prisma.$queryRaw`
    SELECT 
      t.subscriptionTier,
      COUNT(p.id) as transactionCount,
      SUM(p.amount) as totalRevenue,
      SUM(p.platformFee) as totalPlatformFees,
      SUM(p.institutionAmount) as totalInstitutionRevenue
    FROM Payment p
    JOIN Tenant t ON p.tenantId = t.id
    WHERE p.status = 'COMPLETED' 
      AND p.createdAt >= ${startDate}
    GROUP BY t.subscriptionTier
  `;

  // Get top performing institutions
  const topInstitutions = await prisma.$queryRaw`
    SELECT 
      t.id,
      t.name,
      t.slug,
      t.subscriptionTier,
      COUNT(p.id) as transactionCount,
      SUM(p.amount) as totalRevenue,
      SUM(p.platformFee) as totalPlatformFees
    FROM Payment p
    JOIN Tenant t ON p.tenantId = t.id
    WHERE p.status = 'COMPLETED' 
      AND p.createdAt >= ${startDate}
    GROUP BY t.id, t.name, t.slug, t.subscriptionTier
    ORDER BY totalRevenue DESC
    LIMIT 10
  `;

  return {
    period,
    dateRange: {
      start: startDate,
      end: now,
    },
    platformMetrics: {
      totalTransactions: platformStats._count.id || 0,
      totalRevenue: platformStats._sum.amount || 0,
      totalPlatformFees: platformStats._sum.platformFee || 0,
      totalInstitutionRevenue: platformStats._sum.institutionAmount || 0,
      netPlatformRevenue: platformStats._sum.platformFee || 0,
    },
    revenueByTier: Array.isArray(revenueByTier) ? revenueByTier : [],
    topInstitutions: Array.isArray(topInstitutions) ? topInstitutions : [],
  };
}

/**
 * Create a payment record with automatic fee calculation
 */
export async function createPaymentWithFees(data: {
  tenantId: string;
  amount: number;
  applicationId?: string;
  submissionId?: string;
  gateway: string;
  gatewayTransactionId?: string;
  gatewayResponse?: any;
}) {
  const feeCalculation = await calculatePlatformFee({
    amount: data.amount,
    tenantId: data.tenantId,
    paymentType: data.applicationId ? "TRANSACTION" : "FORM_PAYMENT",
  });

  return await prisma.payment.create({
    data: {
      tenantId: data.tenantId,
      applicationId: data.applicationId,
      submissionId: data.submissionId,
      gateway: data.gateway,
      amount: data.amount,
      platformFee: feeCalculation.platformFee,
      institutionAmount: feeCalculation.institutionAmount,
      status: "CREATED",
      gatewayTransactionId: data.gatewayTransactionId,
      gatewayResponse: data.gatewayResponse,
    },
  });
}

/**
 * Process payment reconciliation
 */
export async function reconcilePayments(
  tenantId?: string,
  dateRange?: { start: Date; end: Date }
) {
  const whereClause: any = {};

  if (tenantId) {
    whereClause.tenantId = tenantId;
  }

  if (dateRange) {
    whereClause.createdAt = {
      gte: dateRange.start,
      lte: dateRange.end,
    };
  }

  // Get all payments for reconciliation
  const payments = await prisma.payment.findMany({
    where: whereClause,
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          subscriptionTier: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate reconciliation metrics
  const reconciliation = {
    totalPayments: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    totalPlatformFees: payments.reduce((sum, p) => sum + p.platformFee, 0),
    totalInstitutionAmount: payments.reduce(
      (sum, p) => sum + p.institutionAmount,
      0
    ),
    statusBreakdown: {
      CREATED: payments.filter((p) => p.status === "CREATED").length,
      COMPLETED: payments.filter((p) => p.status === "COMPLETED").length,
      FAILED: payments.filter((p) => p.status === "FAILED").length,
      REFUNDED: payments.filter((p) => p.status === "REFUNDED").length,
    },
    payments: payments.map((payment) => ({
      id: payment.id,
      tenantName: payment.tenant.name,
      amount: payment.amount,
      platformFee: payment.platformFee,
      institutionAmount: payment.institutionAmount,
      status: payment.status,
      createdAt: payment.createdAt,
      gatewayTransactionId: payment.gatewayTransactionId,
    })),
  };

  return reconciliation;
}
