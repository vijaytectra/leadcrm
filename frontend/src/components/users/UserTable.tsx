"use client";

import { memo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Mail,
    Phone,
    UserCheck,
} from "lucide-react";
import { User } from "@/lib/api/users";

interface UserTableProps {
    users: User[];
    onEditUser: (user: User) => void;
    onDeleteUser: (user: User) => void;
    onReactivateUser: (user: User) => void;
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

export const UserTable = memo(function UserTable({
    users,
    onEditUser,
    onDeleteUser,
    onReactivateUser,
}: UserTableProps) {
    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }, []);

    const getInitials = useCallback((firstName: string, lastName: string) => {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                    {users.length} user{users.length !== 1 ? 's' : ''}
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
                        {users.map((user) => (
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
                                            <DropdownMenuItem onClick={() => onEditUser(user)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Send Email
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {user.isActive ? (
                                                <DropdownMenuItem
                                                    onClick={() => onDeleteUser(user)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Deactivate
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    onClick={() => onReactivateUser(user)}
                                                    className="text-green-600"
                                                >
                                                    <UserCheck className="mr-2 h-4 w-4" />
                                                    Reactivate
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
});
