"use client";

import { useState, useCallback, useMemo } from "react";
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/lib/api/users";
import { useToast } from "@/hooks/use-toast";

interface UseUserManagementProps {
  initialUsers: User[];
  tenantSlug: string;
}

export function useUserManagement({
  initialUsers,
  tenantSlug,
}: UseUserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { toast, toasts, dismiss } = useToast();

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Refresh users data
  const refreshUsers = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updatedUsers = await getUsers(tenantSlug);
      setUsers(updatedUsers);
      toast({
        title: "Users refreshed",
        description: "User list has been updated successfully.",
      });
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast({
        title: "Error refreshing users",
        description: "Failed to refresh user list. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [tenantSlug, toast]);

  // User actions
  const handleAddUser = useCallback(() => {
    setSelectedUser(null);
    setIsAddUserOpen(true);
  }, []);

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  }, []);

  const handleDeleteUser = useCallback((user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    setIsLoading(true);
    try {
      await deleteUser(tenantSlug, userToDelete.id);
      setUsers(
        users.map((u) =>
          u.id === userToDelete.id ? { ...u, isActive: false } : u
        )
      );
      setSuccessMessage(
        `${userToDelete.firstName} ${userToDelete.lastName} has been deactivated successfully.`
      );
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error deactivating user",
        description: "Failed to deactivate user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  }, [userToDelete, tenantSlug, users, toast]);

  const handleReactivateUser = useCallback(
    async (user: User) => {
      setIsLoading(true);
      try {
        await updateUser(tenantSlug, user.id, { isActive: true });
        setUsers(
          users.map((u) => (u.id === user.id ? { ...u, isActive: true } : u))
        );
        setSuccessMessage(
          `${user.firstName} ${user.lastName} has been reactivated successfully.`
        );
        setSuccessDialogOpen(true);
      } catch (error) {
        console.error("Error reactivating user:", error);
        toast({
          title: "Error reactivating user",
          description: "Failed to reactivate user. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [tenantSlug, users, toast]
  );

  const handleCreateUser = useCallback(
    async (data: CreateUserRequest) => {
      setIsLoading(true);
      try {
        const response = await createUser(tenantSlug, data);
        setUsers([response.user, ...users]);
        setSuccessMessage(
          `User account created for ${data.firstName} ${data.lastName}. Login credentials have been sent to their email.`
        );
        setSuccessDialogOpen(true);
        setIsAddUserOpen(false);
      } catch (error) {
        console.error("Error creating user:", error);
        toast({
          title: "Error creating user",
          description: "Failed to create user. Please try again.",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [tenantSlug, users, toast]
  );

  const handleUpdateUser = useCallback(
    async (data: UpdateUserRequest) => {
      if (!selectedUser) return;

      setIsLoading(true);
      try {
        const updatedUser = await updateUser(tenantSlug, selectedUser.id, data);
        setUsers(
          users.map((u) => (u.id === selectedUser.id ? updatedUser : u))
        );
        setSuccessMessage(
          `${updatedUser.firstName} ${updatedUser.lastName} has been updated successfully.`
        );
        setSuccessDialogOpen(true);
        setIsEditUserOpen(false);
      } catch (error) {
        console.error("Error updating user:", error);
        toast({
          title: "Error updating user",
          description: "Failed to update user. Please try again.",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedUser, tenantSlug, users, toast]
  );

  // Filter handlers
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleRoleFilterChange = useCallback((role: string) => {
    setRoleFilter(role);
  }, []);

  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  // Dialog handlers
  const closeSuccessDialog = useCallback(() => {
    setSuccessDialogOpen(false);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  }, []);

  const closeAddUserDialog = useCallback(() => {
    setIsAddUserOpen(false);
  }, []);

  const closeEditUserDialog = useCallback(() => {
    setIsEditUserOpen(false);
    setSelectedUser(null);
  }, []);

  return {
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
  };
}
