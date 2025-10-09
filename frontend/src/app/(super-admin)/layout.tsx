
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/ui/navbar";
import { Sidebar } from "@/components/ui/sidebar";
import * as React from "react";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
      <div className={`flex h-screen bg-gray-50 ${className || ""}`}>
        {/* Sidebar - Fixed on the left */}
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header/Navbar - Fixed at the top */}
          <div className="flex-shrink-0">
            <Navbar />
          </div>
          
          {/* Main Content - Scrollable */}
          <main className="flex-1 overflow-auto p-6 bg-white">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Layout;
