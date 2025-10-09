import InstitutionAdminLayout from "@/components/layouts/Client-layout-wrapper";
import * as React from "react";




interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <InstitutionAdminLayout >
        {children}
      </InstitutionAdminLayout>
    </div>
  );
};

export default Layout;
