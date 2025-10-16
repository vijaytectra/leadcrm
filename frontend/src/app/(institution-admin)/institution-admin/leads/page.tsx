"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
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
import { DeleteDialog } from "@/components/ui/confirmation-dialog";
import { useAuthStore } from "@/stores/auth";
import { getClientToken } from "@/lib/client-token";

export default function LeadsPage() {
    const router = useRouter();
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

    const [clientToken, setClientToken] = useState<string | null>(null);


    // Debounced search state
    const [debouncedSearch, setDebouncedSearch] = useState("");

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

    // Delete confirmation dialog state
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { currentTenantSlug } = useAuthStore();
    const { toast } = useToast();

    // Use ref to track if initial load is done
    const isInitialMount = useRef(true);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [filters.search]);




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
        if (!currentTenantSlug || !clientToken) return;

        try {
            const stats = await getAssignmentStats(currentTenantSlug, clientToken);
            setAssignmentStats(stats);
        } catch (error) {
            console.error("Error loading assignment stats:", error);
        }
    }, [currentTenantSlug, clientToken]);

    // Load leads only when filters or tenant changes
    useEffect(() => {
        if (!currentTenantSlug) return;

        const fetchLeads = async () => {
            try {
                setLoading(true);
                // Use debounced search in the API call
                const filtersWithDebouncedSearch = {
                    search: debouncedSearch,
                    status: filters.status,
                    source: filters.source,
                    assigneeId: filters.assigneeId,
                    page: filters.page,
                    limit: filters.limit,
                    sortBy: filters.sortBy,
                    sortOrder: filters.sortOrder
                };
                const response = await getLeads(currentTenantSlug, filtersWithDebouncedSearch);

  
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
        };

        fetchLeads();
    }, [currentTenantSlug, debouncedSearch, filters.status, filters.source, filters.assigneeId, filters.page, filters.limit, filters.sortBy, filters.sortOrder]);


    // Load users and stats only once on mount
    useEffect(() => {
        if (isInitialMount.current && currentTenantSlug) {
            loadUsers();
            loadAssignmentStats();
            isInitialMount.current = false;
        }
    }, [currentTenantSlug, loadUsers, loadAssignmentStats]);

    // Set client token on mount
    useEffect(() => {
        const token = getClientToken();
        if (token) {
            setClientToken(token);
        }
    }, []);

    const handleCreateLead = useCallback(async (leadData: CreateLeadRequest) => {
        if (!currentTenantSlug || !clientToken) {
            toast({
                title: "Error",
                description: "No tenant selected or authentication token missing",
                variant: "destructive",
            });
            return;
        }

        try {
            const newLead = await createLead(currentTenantSlug, leadData, clientToken);
            setLeads(prev => [newLead, ...prev]);
            setShowLeadForm(false);
            toast({
                title: "Success",
                description: "Lead created successfully",
            });
        } catch (error) {
            console.error("Error creating lead:", error);
            toast({
                title: "Error",
                description: "Failed to create lead",
                variant: "destructive",
            });
        }
    }, [currentTenantSlug, clientToken, toast]);

    const handleUpdateLead = useCallback(async (leadId: string, leadData: CreateLeadRequest) => {
        if (!currentTenantSlug || !clientToken) {
            toast({
                title: "Error",
                description: "No tenant selected or authentication token missing",
                variant: "destructive",
            });
            return;
        }

        try {
            const updatedLead = await updateLead(currentTenantSlug, leadId, leadData, clientToken);
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
    }, [currentTenantSlug, clientToken,]);

    const handleDeleteLead = useCallback((leadId: string) => {
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
            setLeadToDelete(lead);
            setShowDeleteDialog(true);
        }
    }, [leads]);

    const confirmDeleteLead = useCallback(async () => {
        if (!leadToDelete || !currentTenantSlug || !clientToken) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteLead(currentTenantSlug, leadToDelete.id, clientToken);
            setLeads(prev => prev.filter(lead => lead.id !== leadToDelete.id));
            toast({
                title: "Success",
                description: "Lead deleted successfully",
            });
            setShowDeleteDialog(false);
            setLeadToDelete(null);
        } catch (error) {
            console.error("Error deleting lead:", error);
            toast({
                title: "Error",
                description: "Failed to delete lead",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    }, [leadToDelete, currentTenantSlug, clientToken,]);

    const cancelDeleteLead = useCallback(() => {
        setShowDeleteDialog(false);
        setLeadToDelete(null);
    }, []);

    const handleImportLeads = useCallback(async (file: File) => {
        if (!currentTenantSlug || !clientToken) {
            toast({
                title: "Error",
                description: "No tenant selected or authentication token missing",
                variant: "destructive",
            });
            return;
        }

        try {
            const result = await importLeads(currentTenantSlug, file, clientToken);
            setShowImportModal(false);
            toast({
                title: "Success",
                description: `${result.imported} leads imported successfully`,
            });
            // Reload leads by fetching them again
            const response = await getLeads(currentTenantSlug, {
                search: debouncedSearch,
                status: filters.status,
                source: filters.source,
                assigneeId: filters.assigneeId,
                page: filters.page,
                limit: filters.limit,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder
            });
            setLeads(response.leads);
            setPagination(response.pagination);
            setStats(response.stats);
        } catch (error) {
            console.error("Error importing leads:", error);
            toast({
                title: "Error",
                description: "Failed to import leads",
                variant: "destructive",
            });
        }
    }, [currentTenantSlug, clientToken, debouncedSearch, filters]);

    const handleAssignLeads = useCallback(async (config: AssignmentConfig) => {
        if (!currentTenantSlug || !clientToken) {
            toast({
                title: "Error",
                description: "No tenant selected or authentication token missing",
                variant: "destructive",
            });
            return;
        }

        try {
            const result = await assignLeads(currentTenantSlug, config, clientToken);
            setShowAssignmentModal(false);
            toast({
                title: "Success",
                description: `${result.assigned} leads assigned successfully`,
            });
            // Reload leads by fetching them again
            const response = await getLeads(currentTenantSlug, {
                search: debouncedSearch,
                status: filters.status,
                source: filters.source,
                assigneeId: filters.assigneeId,
                page: filters.page,
                limit: filters.limit,
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder
            });
            setLeads(response.leads);
            setPagination(response.pagination);
            setStats(response.stats);
            loadAssignmentStats();
        } catch (error) {
            console.error("Error assigning leads:", error);
            toast({
                title: "Error",
                description: "Failed to assign leads",
                variant: "destructive",
            });
        }
    }, [currentTenantSlug, clientToken, toast, loadAssignmentStats, debouncedSearch, filters]);

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
        router.push(`/institution-admin/leads/${lead.id}?tenant=${currentTenantSlug}`);
    }, [router, currentTenantSlug]);

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
        setDebouncedSearch(""); // Reset debounced search as well
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

                {/* Delete Confirmation Dialog */}
                <DeleteDialog
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    title="Delete Lead"
                    description={`Are you sure you want to delete "${leadToDelete?.name}"? This action cannot be undone.`}
                    itemName={leadToDelete?.name}
                    onConfirm={confirmDeleteLead}
                    onCancel={cancelDeleteLead}
                    isLoading={isDeleting}
                />
            </div>
        </div>
    );
}