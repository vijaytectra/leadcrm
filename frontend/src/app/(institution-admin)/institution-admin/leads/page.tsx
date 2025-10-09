"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import {
    Lead,
    CreateLeadRequest,
    getLeads,
    createLead,
    updateLead,
    deleteLead,
    importLeads,
    assignLeads,
    getAssignmentStats,

    AssignmentConfig,
    AssignmentStats
} from "@/lib/api/leads";
import { getUsers } from "@/lib/api/users";
import { LeadsHeader } from "@/components/leads/LeadsHeader";
import { LeadsStats } from "@/components/leads/LeadsStats";
import { LeadsFilters } from "@/components/leads/LeadsFilters";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { LeadModals } from "@/components/leads/LeadModals";
import { useAuthStore } from "@/stores/auth";

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [users, setUsers] = useState<Array<{ id: string; firstName: string; lastName: string; email: string; role: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Record<string, number> | null>(null);
    const [assignmentStats, setAssignmentStats] = useState<AssignmentStats | null>(null);

    const [filters, setFilters] = useState({
        search: "",
        status: "",
        source: "",
        assigneeId: "",
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc" as "asc" | "desc"
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    // Modal states
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showLeadDetails, setShowLeadDetails] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const { currentTenantSlug } = useAuthStore();
    const { toast } = useToast();

    // Use ref to track if initial load is done
    const isInitialMount = useRef(true);

    console.log(currentTenantSlug);

    // Remove toast from dependencies
    const loadLeads = useCallback(async () => {
        if (!currentTenantSlug) return;

        try {
            setLoading(true);
            const response = await getLeads(currentTenantSlug, filters);

            setLeads(response.leads);
            setPagination(response.pagination);
            setStats(response.stats);
        } catch (error) {
            console.error("Error loading leads:", error);
            toast({
                title: "Error",
                description: "Failed to load leads",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [filters, currentTenantSlug]); // Removed toast from dependencies

    const loadUsers = useCallback(async () => {
        if (!currentTenantSlug) return;

        try {
            const usersData = await getUsers(currentTenantSlug);

            setUsers(usersData);
        } catch (error) {
            console.error("Error loading users:", error);
        }
    }, [currentTenantSlug]);

    const loadAssignmentStats = useCallback(async () => {
        if (!currentTenantSlug) return;

        try {



            const stats = await getAssignmentStats(currentTenantSlug);
            console.log("stats", stats);
            setAssignmentStats(stats);
        } catch (error) {
            console.error("Error loading assignment stats:", error);
        }
    }, [currentTenantSlug]);

    // Load leads only when filters or tenant changes
    useEffect(() => {
        if (currentTenantSlug) {
            loadLeads();
        }
    }, [currentTenantSlug, filters.search, filters.status, filters.source, filters.assigneeId, filters.page, filters.limit, filters.sortBy, filters.sortOrder]); // Specific filter dependencies instead of entire filters object

    // Load users and stats only once on mount
    useEffect(() => {
        if (isInitialMount.current && currentTenantSlug) {
            loadUsers();
            loadAssignmentStats();
            isInitialMount.current = false;
        }
    }, [currentTenantSlug, loadUsers, loadAssignmentStats]);

    const handleCreateLead = useCallback(async (leadData: CreateLeadRequest) => {
        if (!currentTenantSlug) {
            toast({
                title: "Error",
                description: "No tenant selected",
                variant: "destructive",
            });
            return;
        }

        try {
            const newLead = await createLead(currentTenantSlug, leadData);
            setLeads(prev => [newLead, ...prev]);
            setShowLeadForm(false);
            toast({
                title: "Success",
                description: "Lead created successfully",
            });
            loadLeads();
        } catch (error) {
            console.error("Error creating lead:", error);
            toast({
                title: "Error",
                description: "Failed to create lead",
                variant: "destructive",
            });
        }
    }, [currentTenantSlug, toast, loadLeads]);

    const handleUpdateLead = useCallback(async (leadId: string, leadData: CreateLeadRequest) => {
        if (!currentTenantSlug) {
            toast({
                title: "Error",
                description: "No tenant selected",
                variant: "destructive",
            });
            return;
        }

        try {
            const updatedLead = await updateLead(currentTenantSlug, leadId, leadData);
            setLeads(prev => prev.map(lead => lead.id === leadId ? updatedLead : lead));
            setEditingLead(null);
            setShowLeadForm(false);
            toast({
                title: "Success",
                description: "Lead updated successfully",
            });
        } catch (error) {
            console.error("Error updating lead:", error);
            toast({
                title: "Error",
                description: "Failed to update lead",
                variant: "destructive",
            });
        }
    }, [currentTenantSlug, toast]);

    const handleDeleteLead = useCallback(async (leadId: string) => {
        if (!window.confirm("Are you sure you want to delete this lead?")) {
            return;
        }

        if (!currentTenantSlug) {
            toast({
                title: "Error",
                description: "No tenant selected",
                variant: "destructive",
            });
            return;
        }

        try {
            await deleteLead(currentTenantSlug, leadId);
            setLeads(prev => prev.filter(lead => lead.id !== leadId));
            toast({
                title: "Success",
                description: "Lead deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting lead:", error);
            toast({
                title: "Error",
                description: "Failed to delete lead",
                variant: "destructive",
            });
        }
    }, [currentTenantSlug, toast]);

    const handleImportLeads = useCallback(async (file: File) => {
        if (!currentTenantSlug) {
            toast({
                title: "Error",
                description: "No tenant selected",
                variant: "destructive",
            });
            return;
        }

        try {
            const result = await importLeads(currentTenantSlug, file);
            setShowImportModal(false);
            toast({
                title: "Success",
                description: `${result.imported} leads imported successfully`,
            });
            loadLeads();
        } catch (error) {
            console.error("Error importing leads:", error);
            toast({
                title: "Error",
                description: "Failed to import leads",
                variant: "destructive",
            });
        }
    }, [currentTenantSlug, toast, loadLeads]);

    const handleAssignLeads = useCallback(async (config: AssignmentConfig) => {
        if (!currentTenantSlug) {
            toast({
                title: "Error",
                description: "No tenant selected",
                variant: "destructive",
            });
            return;
        }

        try {
            const result = await assignLeads(currentTenantSlug, config);
            setShowAssignmentModal(false);
            toast({
                title: "Success",
                description: `${result.assigned} leads assigned successfully`,
            });
            loadLeads();
            loadAssignmentStats();
        } catch (error) {
            console.error("Error assigning leads:", error);
            toast({
                title: "Error",
                description: "Failed to assign leads",
                variant: "destructive",
            });
        }
    }, [currentTenantSlug, toast, loadLeads, loadAssignmentStats]);

    // Modal handlers
    const handleShowLeadForm = useCallback(() => {
        setEditingLead(null);
        setShowLeadForm(true);
    }, []);

    const handleEditLead = useCallback((lead: Lead) => {
        setEditingLead(lead);
        setShowLeadForm(true);
    }, []);

    const handleViewLead = useCallback((lead: Lead) => {
        setSelectedLead(lead);
        setShowLeadDetails(true);
    }, []);

    const handleCloseLeadForm = useCallback(() => {
        setShowLeadForm(false);
        setEditingLead(null);
    }, []);

    const handleCloseLeadDetails = useCallback(() => {
        setShowLeadDetails(false);
        setSelectedLead(null);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setFilters(prev => ({ ...prev, page }));
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters({
            search: "",
            status: "",
            source: "",
            assigneeId: "",
            page: 1,
            limit: 10,
            sortBy: "createdAt",
            sortOrder: "desc"
        });
    }, []);

    return (
        <div className=" relative bg-gradient-to-br from-slate-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <LeadsHeader
                    onShowImportModal={() => setShowImportModal(true)}
                    onShowAssignmentModal={() => setShowAssignmentModal(true)}
                    onShowLeadForm={handleShowLeadForm}
                />

                <LeadsStats
                    stats={stats}
                    loading={loading}
                />

                <LeadsFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onSearch={loadLeads}
                    onReset={handleResetFilters}
                    loading={loading}
                />

                <LeadsTable
                    leads={leads}
                    loading={loading}
                    pagination={pagination}
                    onViewLead={handleViewLead}
                    onEditLead={handleEditLead}
                    onDeleteLead={handleDeleteLead}
                    onPageChange={handlePageChange}
                />

                <LeadModals
                    showLeadForm={showLeadForm}
                    showImportModal={showImportModal}
                    showAssignmentModal={showAssignmentModal}
                    showLeadDetails={showLeadDetails}
                    editingLead={editingLead}
                    selectedLead={selectedLead}
                    users={users}
                    assignmentStats={assignmentStats}
                    onCreateLead={handleCreateLead}
                    onUpdateLead={handleUpdateLead}
                    onImportLeads={handleImportLeads}
                    onAssignLeads={handleAssignLeads}
                    onCloseLeadForm={handleCloseLeadForm}
                    onCloseImportModal={() => setShowImportModal(false)}
                    onCloseAssignmentModal={() => setShowAssignmentModal(false)}
                    onCloseLeadDetails={handleCloseLeadDetails}
                />
            </div>
        </div>
    );
}