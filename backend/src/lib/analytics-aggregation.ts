import { prisma } from "./prisma";
import type {
  AnalyticsMetrics,
  TeamPerformanceMetric,
} from "../types/analytics";

export class AnalyticsAggregator {
  async aggregateHourlyData(tenantId: string, date: Date) {
    const startOfHour = new Date(date);
    startOfHour.setMinutes(0, 0, 0);
    const endOfHour = new Date(startOfHour);
    endOfHour.setHours(endOfHour.getHours() + 1);

    const metrics = await this.calculateMetrics(
      tenantId,
      startOfHour,
      endOfHour
    );

    await prisma.analyticsSnapshot.upsert({
      where: {
        tenantId_date_period: {
          tenantId,
          date: startOfHour,
          period: "HOURLY",
        },
      },
      update: { metrics },
      create: {
        tenantId,
        date: startOfHour,
        period: "HOURLY",
        metrics,
      },
    });
  }

  async aggregateDailyData(tenantId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const metrics = await this.calculateMetrics(tenantId, startOfDay, endOfDay);

    await prisma.analyticsSnapshot.upsert({
      where: {
        tenantId_date_period: {
          tenantId,
          date: startOfDay,
          period: "DAILY",
        },
      },
      update: { metrics },
      create: {
        tenantId,
        date: startOfDay,
        period: "DAILY",
        metrics,
      },
    });
  }

  async aggregateWeeklyData(tenantId: string, date: Date) {
    const startOfWeek = this.getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const metrics = await this.calculateMetrics(
      tenantId,
      startOfWeek,
      endOfWeek
    );

    await prisma.analyticsSnapshot.upsert({
      where: {
        tenantId_date_period: {
          tenantId,
          date: startOfWeek,
          period: "WEEKLY",
        },
      },
      update: { metrics },
      create: {
        tenantId,
        date: startOfWeek,
        period: "WEEKLY",
        metrics,
      },
    });
  }

  async aggregateMonthlyData(tenantId: string, date: Date) {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const metrics = await this.calculateMetrics(
      tenantId,
      startOfMonth,
      endOfMonth
    );

    await prisma.analyticsSnapshot.upsert({
      where: {
        tenantId_date_period: {
          tenantId,
          date: startOfMonth,
          period: "MONTHLY",
        },
      },
      update: { metrics },
      create: {
        tenantId,
        date: startOfMonth,
        period: "MONTHLY",
        metrics,
      },
    });
  }

  private async calculateMetrics(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsMetrics> {
    // Get all leads in the period
    const leads = await prisma.lead.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        sourceTracking: true,
        assignee: {
          select: { id: true, name: true },
        },
      },
    });

    const totalLeads = leads.length;
    const newLeads = leads.filter((lead) => lead.status === "NEW").length;
    const convertedLeads = leads.filter(
      (lead) => lead.status === "CONVERTED"
    ).length;
    const lostLeads = leads.filter((lead) => lead.status === "LOST").length;
    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // Leads by source
    const leadsBySource = leads.reduce((acc, lead) => {
      const source = lead.sourceTracking?.platform || lead.source || "UNKNOWN";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Leads by status
    const leadsByStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Team performance
    const teamPerformance = await this.calculateTeamPerformance(
      tenantId,
      startDate,
      endDate
    );

    return {
      totalLeads,
      newLeads,
      convertedLeads,
      lostLeads,
      conversionRate,
      leadsBySource,
      leadsByStatus,
      teamPerformance,
    };
  }

  private async calculateTeamPerformance(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TeamPerformanceMetric[]> {
    const users = await prisma.user.findMany({
      where: {
        tenantId,
        role: { in: ["TELECALLER", "ADMISSION_TEAM", "ADMISSION_HEAD"] },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            assignedLeads: {
              where: {
                createdAt: { gte: startDate, lte: endDate },
              },
            },
          },
        },
      },
    });

    return users.map((user) => {
      const assignedLeads = user._count.assignedLeads;
      const convertedLeads = 0; // This would need to be calculated from actual conversion data
      const conversionRate =
        assignedLeads > 0 ? (convertedLeads / assignedLeads) * 100 : 0;

      return {
        userId: user.id,
        userName: user.name,
        callsMade: 0, // This would need to be calculated from call logs
        callsAnswered: 0,
        leadsConverted: convertedLeads,
        conversionRate,
      };
    });
  }

  private getStartOfWeek(date: Date): Date {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  async runAggregation(tenantId?: string) {
    const now = new Date();

    if (tenantId) {
      await this.aggregateForTenant(tenantId, now);
    } else {
      // Run for all tenants
      const tenants = await prisma.tenant.findMany({
        select: { id: true },
      });

      await Promise.all(
        tenants.map((tenant) => this.aggregateForTenant(tenant.id, now))
      );
    }
  }

  private async aggregateForTenant(tenantId: string, date: Date) {
    try {
      await this.aggregateHourlyData(tenantId, date);
      await this.aggregateDailyData(tenantId, date);

      // Weekly aggregation (run on Mondays)
      if (date.getDay() === 1) {
        await this.aggregateWeeklyData(tenantId, date);
      }

      // Monthly aggregation (run on 1st of month)
      if (date.getDate() === 1) {
        await this.aggregateMonthlyData(tenantId, date);
      }
    } catch (error) {
      console.error(
        `Analytics aggregation failed for tenant ${tenantId}:`,
        error
      );
    }
  }
}

export const analyticsAggregator = new AnalyticsAggregator();
