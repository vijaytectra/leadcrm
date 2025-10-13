import fs from "fs";
import path from "path";
import { prisma } from "./prisma";
import { analyticsAggregator } from "./analytics-aggregation";
import type { ReportConfig, ReportTemplate } from "../types/analytics";

export class ReportGenerator {
  private reportsDir: string;

  constructor() {
    this.reportsDir = process.env.REPORT_STORAGE_PATH || "./reports";
    this.ensureReportsDirectory();
  }

  private ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generateReport(
    templateId: string,
    generatedBy: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<{ fileName: string; fileUrl: string; fileType: string }> {
    const template = await prisma.reportTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error("Report template not found");
    }

    const config = template.config as ReportConfig;
    const data = await this.fetchReportData(
      template.tenantId,
      config,
      periodStart,
      periodEnd
    );

    const fileName = `${template.name}_${this.formatDate(
      periodStart
    )}_${this.formatDate(periodEnd)}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    // Generate PDF report
    await this.generatePDFReport(data, config, filePath);

    const fileUrl = `/api/reports/${fileName}`;

    // Save to database
    await prisma.generatedReport.create({
      data: {
        templateId,
        tenantId: template.tenantId,
        fileName,
        fileUrl,
        fileType: "PDF",
        generatedBy,
        periodStart,
        periodEnd,
      },
    });

    return { fileName, fileUrl, fileType: "PDF" };
  }

  async generateExcelReport(
    templateId: string,
    generatedBy: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<{ fileName: string; fileUrl: string; fileType: string }> {
    const template = await prisma.reportTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error("Report template not found");
    }

    const config = template.config as ReportConfig;
    const data = await this.fetchReportData(
      template.tenantId,
      config,
      periodStart,
      periodEnd
    );

    const fileName = `${template.name}_${this.formatDate(
      periodStart
    )}_${this.formatDate(periodEnd)}.xlsx`;
    const filePath = path.join(this.reportsDir, fileName);

    // Generate Excel report
    await this.generateExcelFile(data, config, filePath);

    const fileUrl = `/api/reports/${fileName}`;

    // Save to database
    await prisma.generatedReport.create({
      data: {
        templateId,
        tenantId: template.tenantId,
        fileName,
        fileUrl,
        fileType: "EXCEL",
        generatedBy,
        periodStart,
        periodEnd,
      },
    });

    return { fileName, fileUrl, fileType: "EXCEL" };
  }

  private async fetchReportData(
    tenantId: string,
    config: ReportConfig,
    periodStart: Date,
    periodEnd: Date
  ) {
    // Get analytics snapshots for the period
    const snapshots = await prisma.analyticsSnapshot.findMany({
      where: {
        tenantId,
        date: {
          gte: periodStart,
          lte: periodEnd,
        },
        period: "DAILY",
      },
      orderBy: { date: "asc" },
    });

    // Get leads data
    const leads = await prisma.lead.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        sourceTracking: true,
        assignee: {
          select: { id: true, name: true },
        },
      },
    });

    // Get team performance
    const teamPerformance = await this.getTeamPerformance(
      tenantId,
      periodStart,
      periodEnd
    );

    return {
      period: { start: periodStart, end: periodEnd },
      snapshots,
      leads,
      teamPerformance,
      summary: this.calculateSummary(snapshots, leads),
    };
  }

  private async getTeamPerformance(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ) {
    const users = await prisma.user.findMany({
      where: {
        tenantId,
        role: { in: ["TELECALLER", "ADMISSION_TEAM", "ADMISSION_HEAD"] },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
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

    return users.map((user) => ({
      userId: user.id,
      userName: user.name,
      email: user.email,
      role: user.role,
      leadsAssigned: user._count.assignedLeads,
      // Additional metrics would be calculated here
    }));
  }

  private calculateSummary(snapshots: any[], leads: any[]) {
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(
      (lead) => lead.status === "CONVERTED"
    ).length;
    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    const leadsBySource = leads.reduce((acc, lead) => {
      const source = lead.sourceTracking?.platform || lead.source || "UNKNOWN";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLeads,
      convertedLeads,
      conversionRate,
      leadsBySource,
      averageLeadsPerDay: totalLeads / Math.max(snapshots.length, 1),
    };
  }

  private async generatePDFReport(
    data: any,
    config: ReportConfig,
    filePath: string
  ) {
    // This would use a PDF generation library like puppeteer or pdfmake
    // For now, we'll create a simple text file as placeholder
    const content = this.generateReportContent(data, config);
    fs.writeFileSync(filePath, content);
  }

  private async generateExcelFile(
    data: any,
    config: ReportConfig,
    filePath: string
  ) {
    // This would use a library like exceljs
    // For now, we'll create a simple CSV file as placeholder
    const content = this.generateCSVContent(data, config);
    fs.writeFileSync(filePath, content);
  }

  private generateReportContent(data: any, config: ReportConfig): string {
    const { period, summary } = data;

    return `
LEAD101 Analytics Report
Period: ${this.formatDate(period.start)} to ${this.formatDate(period.end)}

SUMMARY
- Total Leads: ${summary.totalLeads}
- Converted Leads: ${summary.convertedLeads}
- Conversion Rate: ${summary.conversionRate.toFixed(2)}%
- Average Leads per Day: ${summary.averageLeadsPerDay.toFixed(2)}

LEADS BY SOURCE
${Object.entries(summary.leadsBySource)
  .map(([source, count]) => `- ${source}: ${count}`)
  .join("\n")}

Generated on: ${new Date().toISOString()}
    `.trim();
  }

  private generateCSVContent(data: any, config: ReportConfig): string {
    const { leads } = data;

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Source",
      "Status",
      "Created At",
    ];
    const rows = leads.map((lead: any) => [
      lead.name,
      lead.email || "",
      lead.phone || "",
      lead.sourceTracking?.platform || lead.source || "UNKNOWN",
      lead.status,
      lead.createdAt.toISOString(),
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }
}

export const reportGenerator = new ReportGenerator();
