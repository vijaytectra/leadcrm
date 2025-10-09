import { Metadata } from "next";
import { UserManagement } from "@/components/institution-admin/UserManagement";
import { getUsers } from "@/lib/api/users";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage your institution's users and their roles",
};

interface UserManagementPageProps {
  searchParams: Promise<{
    tenant?: string;
  }>;
}

export default async function UserManagementPage({
  searchParams,
}: UserManagementPageProps) {
  const resolvedSearchParams = await searchParams;
  const tenantSlug = resolvedSearchParams.tenant;

  if (!tenantSlug) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-heading-text mb-2">
            Tenant Required
          </h2>
          <p className="text-subtext">
            Please select a tenant to manage users.
          </p>
        </div>
      </div>
    );
  }

  try {
    const users = await getUsers(tenantSlug);
    return <UserManagement users={users} tenantSlug={tenantSlug} />;
  } catch (error) {
    console.error("Error loading users:", error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-heading-text mb-2">
            Error Loading Users
          </h2>
          <p className="text-subtext">
            Unable to load user data. Please try again.
          </p>
        </div>
      </div>
    );
  }
}
