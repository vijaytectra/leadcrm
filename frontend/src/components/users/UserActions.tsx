"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw } from "lucide-react";

interface UserActionsProps {
    onAddUser: () => void;
    onRefreshUsers: () => void;
    isRefreshing: boolean;
    isLoading: boolean;
}

export const UserActions = memo(function UserActions({
    onAddUser,
    onRefreshUsers,
    isRefreshing,
    isLoading,
}: UserActionsProps) {
    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                onClick={onRefreshUsers}
                disabled={isRefreshing}
            >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
            </Button>
            <Button onClick={onAddUser} disabled={isLoading}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
            </Button>
        </div>
    );
});
