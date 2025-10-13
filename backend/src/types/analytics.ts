export interface AnalyticsSnapshot {
  id: string;
  tenantId: string;
  date: Date;
  period: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  metrics: AnalyticsMetrics;
  createdAt: Date;
}

export interface AnalyticsMetrics {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  lostLeads: number;
  conversionRate: number;
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
  teamPerformance: TeamPerformanceMetric[];
}

export interface TeamPerformanceMetric {
  userId: string;
  userName: string;
  callsMade: number;
  callsAnswered: number;
  leadsConverted: number;
  conversionRate: number;
}

export interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
  dropOffRate: number;
}

export interface ReportTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: "FUNNEL" | "CONVERSION" | "SOURCE" | "TEAM" | "ROI" | "CUSTOM";
  config: ReportConfig;
  schedule?: ReportSchedule;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportConfig {
  metrics: string[];
  filters: Record<string, unknown>;
  groupBy: string[];
  dateRange:
    | { start: Date; end: Date }
    | "LAST_7_DAYS"
    | "LAST_30_DAYS"
    | "THIS_MONTH";
  chartTypes: ("bar" | "line" | "pie" | "table")[];
}

export interface ReportSchedule {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
}
