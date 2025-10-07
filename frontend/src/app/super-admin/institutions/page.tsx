"use client";

import React from "react";
import { SuperAdminLayout } from "@/components/layouts/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddInstitutionModal } from "@/components/modals/AddInstitutionModal";
import { apiGet, apiPost } from "@/lib/utils";
import {
    Building2,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    Mail,
    Calendar,
    Users,
    DollarSign
} from "lucide-react";

// Mock data
const mockInstitutions = [
    {
        id: "1",
        name: "ABC College",
        email: "admin@abccollege.edu",
        phone: "+91 98765 43210",
        address: "123 Education Street, Mumbai, Maharashtra",
        status: "active",
        subscription: "PRO",
        plan: "PRO",
        revenue: 45000,
        users: 12,
        joinedDate: "2024-01-15",
        lastActive: "2024-01-28"
    },
    {
        id: "2",
        name: "XYZ School",
        email: "admin@xyzschool.edu",
        phone: "+91 98765 43211",
        address: "456 Learning Avenue, Delhi, Delhi",
        status: "active",
        subscription: "STARTER",
        plan: "STARTER",
        revenue: 25000,
        users: 5,
        joinedDate: "2024-01-20",
        lastActive: "2024-01-27"
    },
    {
        id: "3",
        name: "DEF Institute",
        email: "admin@definstitute.edu",
        phone: "+91 98765 43212",
        address: "789 Knowledge Road, Bangalore, Karnataka",
        status: "pending",
        subscription: "MAX",
        plan: "MAX",
        revenue: 75000,
        users: 18,
        joinedDate: "2024-01-25",
        lastActive: "2024-01-26"
    },
    {
        id: "4",
        name: "GHI University",
        email: "admin@ghiuniversity.edu",
        phone: "+91 98765 43213",
        address: "321 Academic Lane, Chennai, Tamil Nadu",
        status: "suspended",
        subscription: "PRO",
        plan: "PRO",
        revenue: 0,
        users: 0,
        joinedDate: "2024-01-10",
        lastActive: "2024-01-20"
    }
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case "active":
            return <Badge variant="success">Active</Badge>;
        case "pending":
            return <Badge variant="warning">Pending</Badge>;
        case "suspended":
            return <Badge variant="destructive">Suspended</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const getPlanBadge = (plan: string) => {
    switch (plan) {
        case "STARTER":
            return <Badge variant="outline">STARTER</Badge>;
        case "PRO":
            return <Badge variant="default">PRO</Badge>;
        case "MAX":
            return <Badge variant="secondary">MAX</Badge>;
        default:
            return <Badge variant="outline">{plan}</Badge>;
    }
};

interface Institution {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    status: string;
    subscription: string;
    plan: string;
    revenue: number;
    users: number;
    joinedDate: string;
    lastActive: string;
}

export default function InstitutionsPage() {
    const [institutions, setInstitutions] = React.useState<Institution[]>(mockInstitutions);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState<string>("all");

    interface CreateInstitutionResponse {
        success: boolean;
        data: {
            id: string;
            name: string;
            slug: string;
            email: string;
            phone: string;
            address: string;
            subscriptionTier: "STARTER" | "PRO" | "MAX";
            subscriptionStatus: string;
            maxLeads: number;
            maxTeamMembers: number;
            createdAt: string;
            updatedAt: string;
        };
        message: string;
    }

    const handleAddInstitution = async (data: {
        name: string;
        slug: string;
        email: string;
        phone: string;
        address: string;
        subscriptionTier: "STARTER" | "PRO" | "MAX";
        maxLeads: number;
        maxTeamMembers: number;
    }) => {
        setIsLoading(true);
        try {
            const response = await apiPost<CreateInstitutionResponse>("/super-admin/institutions", data);
            if (response.success) {
                // Refresh institutions list
                await fetchInstitutions();
                setIsAddModalOpen(false);
            }
        } catch (error) {
            console.error("Error creating institution:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInstitutions = async () => {
        try {
            const response = await apiGet<{ success: boolean; data: { institutions: Institution[] } }>("/super-admin/institutions");
            if (response.success) {
                setInstitutions(response.data.institutions);
            }
        } catch (error) {
            console.error("Error fetching institutions:", error);
        }
    };

    React.useEffect(() => {
        fetchInstitutions();
    }, []);

    const filteredInstitutions = institutions.filter(institution => {
        const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            institution.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || institution.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <SuperAdminLayout>
            <div className="space-y-6 h-full">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Institutions</h1>
                        <p className="text-gray-600 mt-1">
                            Manage all educational institutions on the platform
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Button variant="outline" className="hidden sm:flex">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                        <Button onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Add Institution</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Institutions</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24</div>
                            <p className="text-xs text-muted-foreground">
                                +3 from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">22</div>
                            <p className="text-xs text-muted-foreground">
                                91.7% active rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">
                                Awaiting approval
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{new Intl.NumberFormat('en-US').format(1250000)}</div>
                            <p className="text-xs text-muted-foreground">
                                +15.2% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <Card className="flex-1 flex flex-col overflow-hidden">
                    <CardHeader className="flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>All Institutions</CardTitle>
                                <CardDescription>
                                    Manage and monitor all educational institutions
                                </CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                <div className="relative w-full sm:w-auto">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search institutions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
                                    />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 ">
                        <div className="">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Institution</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Revenue</TableHead>
                                        <TableHead>Users</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInstitutions.map((institution) => (
                                        <TableRow key={institution.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Building2 className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{institution.name}</p>
                                                        <p className="text-sm text-muted-foreground">{institution.address}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium">{institution.email}</p>
                                                    <p className="text-sm text-muted-foreground">{institution.phone}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(institution.status)}
                                            </TableCell>
                                            <TableCell>
                                                {getPlanBadge(institution.plan)}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">₹{new Intl.NumberFormat('en-US').format(institution.revenue)}</p>
                                                    <p className="text-sm text-muted-foreground">Total revenue</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span>{institution.users}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm">{new Date(institution.joinedDate).toLocaleDateString()}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Last active: {new Date(institution.lastActive).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Institution Modal */}
                <AddInstitutionModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleAddInstitution}
                />
            </div>
        </SuperAdminLayout>
    );
}
