"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";
import { User } from "@/lib/api/users";

interface UserStatsProps {
    users: User[];
}

const roleLabels: Record<string, string> = {
    INSTITUTION_ADMIN: "Institution Admin",
    TELECALLER: "Telecaller",
    DOCUMENT_VERIFIER: "Document Verifier",
    FINANCE_TEAM: "Finance Team",
    ADMISSION_TEAM: "Admission Team",
    ADMISSION_HEAD: "Admission Head",
};

export const UserStats = memo(function UserStats({ users }: UserStatsProps) {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const inactiveUsers = users.filter(u => !u.isActive).length;
    const adminUsers = users.filter(u => u.role === "INSTITUTION_ADMIN").length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-heading-text">
                                {totalUsers}
                            </div>
                            <div className="text-sm text-subtext">Total Users</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-heading-text">
                                {activeUsers}
                            </div>
                            <div className="text-sm text-subtext">Active Users</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <ShieldX className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-heading-text">
                                {inactiveUsers}
                            </div>
                            <div className="text-sm text-subtext">Inactive Users</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Shield className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-heading-text">
                                {adminUsers}
                            </div>
                            <div className="text-sm text-subtext">Admins</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});
