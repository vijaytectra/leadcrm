import { getToken } from "../getToken";
import { apiGet } from "../utils";

import { Lead, LeadNote, LeadActivity } from "./leads";

export interface LeadDetailsData {
  lead: Lead;
  notes: LeadNote[];
  activities: LeadActivity[];
}

/**
 * Get comprehensive lead details including lead info, notes, and activities
 * This function fetches all data server-side for the lead details page
 */
export async function getLeadDetails(
  tenantSlug: string,
  leadId: string,
  userRole: "TELECALLER" | "INSTITUTION_ADMIN"
): Promise<LeadDetailsData> {
  try {
  
    const token = await getToken();
    if (!token) {
      throw new Error("No token found");
    }
   

    // Fetch lead details
    const leadResponse = await apiGet<{ data: Lead }>(
      `/${tenantSlug}/leads/${leadId}`,
      { token: token }
    );
   

    // Fetch lead notes
    const notesResponse = await apiGet<{ data: LeadNote[] }>(
      `/${tenantSlug}/leads/${leadId}/notes`,
      { token: token }
    );

    // Fetch lead activities based on user role
    const activitiesEndpoint =
      userRole === "TELECALLER"
        ? `/${tenantSlug}/telecaller/leads/${leadId}/activities`
        : `/${tenantSlug}/admin/leads/${leadId}/activities`;

    const activitiesResponse = await apiGet<{ data: LeadActivity[] }>(
      activitiesEndpoint,
      { token: token }
    );

    return {
      lead: leadResponse.data,
      notes: notesResponse.data,
      activities: activitiesResponse.data,
    };
  } catch (error) {
    console.error("Error fetching lead details:", error);
    throw error;
  }
}

/**
 * Get lead details for telecaller (assigned leads only)
 */
export async function getTelecallerLeadDetails(
  tenantSlug: string,
  leadId: string
): Promise<LeadDetailsData> {
  return getLeadDetails(tenantSlug, leadId, "TELECALLER");
}

/**
 * Get lead details for institution admin (any lead)
 */
export async function getAdminLeadDetails(
  tenantSlug: string,
  leadId: string
): Promise<LeadDetailsData> {
  return getLeadDetails(tenantSlug, leadId, "INSTITUTION_ADMIN");
}
