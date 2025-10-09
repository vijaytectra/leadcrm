"use client";

import { useTenant } from "@/context/TenantContext";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export function TenantInfo() {
    const { tenantSlug } = useTenant();

    if (!tenantSlug) {
        return null;
    }

    return (
        <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-lg">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Institution:</span>
            <Badge variant="secondary" className="font-medium">
                {tenantSlug}
            </Badge>
        </div>
    );
}
