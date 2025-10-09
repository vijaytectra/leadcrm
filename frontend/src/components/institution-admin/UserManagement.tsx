"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    MoreHorizontal,
    UserPlus,
    Edit,
    Trash2,
    Mail,
    Phone,
    Shield,
    ShieldCheck,
    ShieldX,
    RefreshCw
} from "lucide-react";
import { User, CreateUserRequest, UpdateUserRequest, getUsers, createUser, updateUser, deleteUser } from "@/lib/api/users";
import { UserForm } from "./UserForm";
import { useToast } from "@/hooks/use-toast";
import { ToastContainer } from "@/components/ui/toast";

interface UserManagementProps {
    users: User[];
    tenantSlug: string;
}

const roleLabels: Record<string, string> = {
    INSTITUTION_ADMIN: "Institution Admin",
    TELECALLER: "Telecaller",
    DOCUMENT_VERIFIER: "Document Verifier",
    FINANCE_TEAM: "Finance Team",
    ADMISSION_TEAM: "Admission Team",
    ADMISSION_HEAD: "Admission Head",
};

const roleColors: Record<string, string> = {
    INSTITUTION_ADMIN: "bg-purple-100 text-purple-800",
    TELECALLER: "bg-blue-100 text-blue-800",
    DOCUMENT_VERIFIER: "bg-green-100 text-green-800",
    FINANCE_TEAM: "bg-yellow-100 text-yellow-800",
    ADMISSION_TEAM: "bg-orange-100 text-orange-800",
    ADMISSION_HEAD: "bg-red-100 text-red-800",
};

export function UserManagement({ users: initialUsers, tenantSlug }: UserManagementProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { toast, toasts, dismiss } = useToast();

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "active" && user.isActive) ||
            (statusFilter === "inactive" && !user.isActive);

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Refresh users data
    const refreshUsers = async () => {
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
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsAddUserOpen(true);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsEditUserOpen(true);
    };

    const handleDeleteUser = async (user: User) => {
        if (!confirm(`Are you sure you want to deactivate ${user.firstName} ${user.lastName}?`)) {
            return;
        }

        setIsLoading(true);
        try {
            await deleteUser(tenantSlug, user.id);
            setUsers(users.filter(u => u.id !== user.id));
            toast({
                title: "User deactivated",
                description: `${user.firstName} ${user.lastName} has been deactivated successfully.`,
            });
        } catch (error) {
            console.error("Error deleting user:", error);
            toast({
                title: "Error deactivating user",
                description: "Failed to deactivate user. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateUser = async (data: CreateUserRequest) => {
        setIsLoading(true);
        try {
            const response = await createUser(tenantSlug, data);
            setUsers([response.user, ...users]);
            toast({
                title: "User created successfully",
                description: `User account created for ${data.firstName} ${data.lastName}.${response.generatedPassword
                    ? ` A password has been sent to their email.`
                    : ""
                    }`,
            });
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
    };

    const handleUpdateUser = async (data: UpdateUserRequest) => {
        if (!selectedUser) return;

        setIsLoading(true);
        try {
            const updatedUser = await updateUser(tenantSlug, selectedUser.id, data);
            setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
            toast({
                title: "User updated successfully",
                description: `${updatedUser.firstName} ${updatedUser.lastName} has been updated.`,
            });
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
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    };

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
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={refreshUsers}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={handleAddUser} disabled={isLoading}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Shield className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-heading-text">
                                    {users.length}
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
                                    {users.filter(u => u.isActive).length}
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
                                    {users.filter(u => !u.isActive).length}
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
                                    {users.filter(u => u.role === "INSTITUTION_ADMIN").length}
                                </div>
                                <div className="text-sm text-subtext">Admins</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="All Roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {Object.entries(roleLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-32">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                        {filteredUsers.length} of {users.length} users
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Login</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="w-12">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src="" />
                                                <AvatarFallback>
                                                    {getInitials(user.firstName, user.lastName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-heading-text">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="text-sm text-subtext">{user.email}</div>
                                                {user.phone && (
                                                    <div className="text-xs text-subtext flex items-center">
                                                        <Phone className="h-3 w-3 mr-1" />
                                                        {user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={roleColors[user.role] || "bg-gray-100 text-gray-800"}
                                        >
                                            {roleLabels[user.role] || user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.isActive ? "default" : "secondary"}
                                            className={user.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                        >
                                            {user.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-subtext">
                                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
                                    </TableCell>
                                    <TableCell className="text-sm text-subtext">
                                        {formatDate(user.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit User
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Send Email
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Deactivate
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* User Forms */}
            <UserForm
                isOpen={isAddUserOpen}
                onClose={() => setIsAddUserOpen(false)}
                onSubmit={handleCreateUser as (data: CreateUserRequest | UpdateUserRequest) => Promise<void>}
                isLoading={isLoading}
            />

            <UserForm
                isOpen={isEditUserOpen}
                onClose={() => setIsEditUserOpen(false)}
                onSubmit={handleUpdateUser as (data: CreateUserRequest | UpdateUserRequest) => Promise<void>}
                user={selectedUser}
                isLoading={isLoading}
            />

            {/* Toast Container */}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </div>
    );
}
