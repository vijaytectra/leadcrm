"use server";

import { getLeadsPageData } from "./leads-data";
import { getClientToken } from "@/lib/client-token";
import { redirect } from "next/navigation";

export async function getLeadsData(tenantSlug: string, searchParams: Record<string, string | string[] | undefined>) {
  try {
    const token = getClientToken();
    if (!token) {
      redirect("/login");
    }

    const params = {
      page: typeof searchParams.page === "string" ? searchParams.page : undefined,
      limit: typeof searchParams.limit === "string" ? searchParams.limit : undefined,
      status: typeof searchParams.status === "string" ? searchParams.status : undefined,
      source: typeof searchParams.source === "string" ? searchParams.source : undefined,
      assigneeId: typeof searchParams.assigneeId === "string" ? searchParams.assigneeId : undefined,
      search: typeof searchParams.search === "string" ? searchParams.search : undefined,
      sortBy: typeof searchParams.sortBy === "string" ? searchParams.sortBy : undefined,
      sortOrder: typeof searchParams.sortOrder === "string" ? searchParams.sortOrder : undefined,
    };

    return await getLeadsPageData(tenantSlug, params);
  } catch (error) {
    console.error("Error in getLeadsData:", error);
    throw error;
  }
}
