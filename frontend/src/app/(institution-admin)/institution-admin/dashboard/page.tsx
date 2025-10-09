import { Metadata } from "next";
import { InstitutionDashboard } from "@/components/institution-admin/InstitutionDashboard";
import { getInstitutionStats } from "@/lib/api/institution";
import { Building2, AlertTriangle, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Institution Dashboard",
  description: "Overview of your institution's performance and metrics",
};

interface InstitutionAdminPageProps {
  searchParams: Promise<{
    tenant?: string;
  }>;
}

export default async function InstitutionAdminPage({
  searchParams,
}: InstitutionAdminPageProps) {
  const resolvedSearchParams = await searchParams;
  const tenantSlug = resolvedSearchParams.tenant;

  if (!tenantSlug) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center">
              <Building2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Select Your Institution
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Choose an institution from your account to view detailed analytics, 
              manage users, and access administrative tools.
            </p>
          </div>
          
          {/* Action Area */}
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
              <Building2 className="w-4 h-4" />
              <span>Use the tenant selector above</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  try {
    const stats = await getInstitutionStats(tenantSlug);
    return <InstitutionDashboard stats={stats} tenantSlug={tenantSlug} />;
  } catch (error) {
    return (
      <div className=" flex items-center justify-center px-4">
        <div className="max-w-lg mx-auto text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Unable to Load Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We&apos;re having trouble connecting to your institution&apos;s data. 
              This could be a temporary issue with our servers or your connection.
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button 
              onClick={() => window.location.reload()} 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button 
              onClick={() => window.history.back()} 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              Go Back
            </button>
          </div>
          
          {/* Additional Help */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Still having issues? 
              <button className="ml-1 text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
