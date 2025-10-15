interface InstitutionStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  upcomingAppointments: number;
  pendingTasks: number;
}

interface BackendAnalyticsOverview {
  totalLeads: number;
  totalForms: number;
  totalWidgets: number;
  totalSubmissions: number;
  overallConversionRate: number;
}

interface InstitutionSettings {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  timezone: string;
  currency: string;
  maxUsers: number;
  maxLeads: number;
  features: {
    formBuilder: boolean;
    analytics: boolean;
    integrations: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
    monthlyReports: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: string;
    ipWhitelist: string[];
  };
}

interface InstitutionInfo {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  timezone: string;
  currency: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  createdAt: string;
  updatedAt: string;
}

import { ApiException, apiGet, apiPost } from "@/lib/utils";
import { getToken } from "../getToken";

export async function getInstitutionStats(
  tenantSlug: string
): Promise<InstitutionStats> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const data = await apiGet<{ data: { overview: BackendAnalyticsOverview } }>(
      `/${tenantSlug}/analytics/dashboard`,
      {
        token: token,
      }
    );

    // Map backend data to expected frontend format
    const backendData = data.data.overview;
    return {
      totalUsers: 0, // Not available in analytics
      activeUsers: 0, // Not available in analytics
      newUsersThisMonth: 0, // Not available in analytics
      totalLeads: backendData.totalLeads || 0,
      convertedLeads: Math.round(
        ((backendData.totalLeads || 0) *
          (backendData.overallConversionRate || 0)) /
          100
      ),
      conversionRate: backendData.overallConversionRate || 0,
      monthlyRevenue: 0, // Not available in analytics
      revenueGrowth: 0, // Not available in analytics
      upcomingAppointments: 0, // Not available in analytics
      pendingTasks: 0, // Not available in analytics
    };
  } catch (error) {
    console.error("Error fetching institution stats:", error);
    if (error instanceof ApiException) {
      console.error("Error fetching institution stats:", error.message);
    } else {
      console.error("Error fetching institution stats:", error);
    }
    // Return mock data for development
    return {
      totalUsers: 12,
      activeUsers: 10,
      newUsersThisMonth: 3,
      totalLeads: 156,
      convertedLeads: 23,
      conversionRate: 14.7,
      monthlyRevenue: 45000,
      revenueGrowth: 12.5,
      upcomingAppointments: 8,
      pendingTasks: 5,
    };
  }
}

export async function getInstitutionSettings(
  tenantSlug: string
): Promise<InstitutionSettings> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const data = await apiGet<{ settings: InstitutionSettings }>(
      `/${tenantSlug}/settings`,
      {
        token: token,
      }
    );
    return data.settings;
  } catch (error) {
    console.error("Error fetching institution settings:", error);
    // Return mock data for development
    return {
      id: "inst_123",
      name: "Example Institution",
      email: "contact@example.edu",
      phone: "+1 (555) 123-4567",
      address: "123 Education Street, City, State 12345",
      website: "https://www.example.edu",
      description:
        "A leading educational institution committed to excellence in learning.",
      timezone: "America/New_York",
      currency: "USD",
      maxUsers: 50,
      maxLeads: 1000,
      features: {
        formBuilder: true,
        analytics: true,
        integrations: true,
        customBranding: false,
        apiAccess: false,
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        weeklyReports: true,
        monthlyReports: true,
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordPolicy: "medium",
        ipWhitelist: [],
      },
    };
  }
}

export async function updateInstitutionSettings(
  tenantSlug: string,
  settings: Partial<InstitutionSettings>
): Promise<InstitutionSettings> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const data = await apiPost<{ settings: InstitutionSettings }>(
      `/${tenantSlug}/settings`,
      settings,
      { token: token }
    );
    return data.settings;
  } catch (error) {
    console.error("Error updating institution settings:", error);
    throw error;
  }
}

export async function getInstitutionInfo(tenantSlug: string) {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
    const data = await apiGet<{ institution: InstitutionInfo }>(
      `/${tenantSlug}/info`,
      {
        token: token,
      }
    );
    return data.institution;
  } catch (error) {
    console.error("Error fetching institution info:", error);
    throw error;
  }
}
