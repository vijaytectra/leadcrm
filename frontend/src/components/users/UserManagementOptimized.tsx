"use client";

import { memo } from "react";
import { User } from "@/lib/api/users";
import { UserForm } from "./UserForm";
import { UserStats } from "./UserStats";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { UserActions } from "./UserActions";
import { DeleteDialog, InfoDialog } from "@/components/ui/confirmation-dialog";
import { ToastContainer } from "@/components/ui/toast";
import { useUserManagement } from "@/hooks/useUserManagement";
import { CreateUserRequest, UpdateUserRequest } from "@/lib/api/users";

interface UserManagementProps {
    users: User[];
    tenantSlug: string;
}

export const UserManagementOptimized = memo(function UserManagementOptimized({
    users: initialUsers,
    tenantSlug
}: UserManagementProps) {
    const {
        // State
        users,
        filteredUsers,
        searchQuery,
        roleFilter,
        statusFilter,
        isAddUserOpen,
        isEditUserOpen,
        selectedUser,
        isLoading,
        isRefreshing,
        deleteDialogOpen,
        userToDelete,
        successDialogOpen,
        successMessage,
        toasts,

        // Actions
        refreshUsers,
        handleAddUser,
        handleEditUser,
        handleDeleteUser,
        confirmDeleteUser,
        handleReactivateUser,
        handleCreateUser,
        handleUpdateUser,
        handleSearchChange,
        handleRoleFilterChange,
        handleStatusFilterChange,

        // Dialog handlers
        closeSuccessDialog,
        closeDeleteDialog,
        closeAddUserDialog,
        closeEditUserDialog,
        dismiss,
    } = useUserManagement({ initialUsers, tenantSlug });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-heading-text">
                        User Management
                    </h1>
                    <p className="text-subtext mt-1">
                        Manage your institution&apos;s team members and their roles
                    </p>
                </div>
                <UserActions
                    onAddUser={handleAddUser}
                    onRefreshUsers={refreshUsers}
                    isRefreshing={isRefreshing}
                    isLoading={isLoading}
                />
            </div>

            {/* Stats Cards */}
            <UserStats users={users} />

            {/* Filters and Search */}
            <UserFilters
                searchQuery={searchQuery}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                onSearchChange={handleSearchChange}
                onRoleFilterChange={handleRoleFilterChange}
                onStatusFilterChange={handleStatusFilterChange}
            />

            {/* Users Table */}
            <UserTable
                users={filteredUsers}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                onReactivateUser={handleReactivateUser}
            />

            {/* User Forms */}
            <UserForm
                isOpen={isAddUserOpen}
                onClose={closeAddUserDialog}
                onSubmit={handleCreateUser as (data: CreateUserRequest | UpdateUserRequest) => Promise<void>}
                isLoading={isLoading}
            />

            <UserForm
                isOpen={isEditUserOpen}
                onClose={closeEditUserDialog}
                onSubmit={handleUpdateUser as (data: CreateUserRequest | UpdateUserRequest) => Promise<void>}
                user={selectedUser}
                isLoading={isLoading}
            />

            {/* Confirmation Dialogs */}
            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={closeDeleteDialog}
                title="Deactivate User"
                description="Are you sure you want to deactivate this user? They will no longer be able to access the system."
                itemName={userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName}` : undefined}
                onConfirm={confirmDeleteUser}
                isLoading={isLoading}
            />

            <InfoDialog
                open={successDialogOpen}
                onOpenChange={closeSuccessDialog}
                title="Success"
                description={successMessage}
                onConfirm={closeSuccessDialog}
            />

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </div>
    );
});
