"use client";

import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lead,
  CreateLeadRequest,
  updateLead,
  deleteLead,
  importLeads,
  assignLeads,
  AssignmentConfig,
  AssignmentStats
} from "@/lib/api/leads";
import { LeadsHeader } from "./LeadsHeader";
import { LeadsStats } from "./LeadsStats";
import { LeadsFilters } from "./LeadsFilters";
import { LeadsTable } from "./LeadsTable";
import { LeadModals } from "./LeadModals";
import { DeleteDialog } from "@/components/ui/confirmation-dialog";

interface LeadsPageClientProps {
  initialData: {
    leads: Lead[];
    users: Array<{ id: string; firstName: string; lastName: string; email: string; role: string }>;
    stats: Record<string, number> | null;
    assignmentStats: AssignmentStats | null;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  tenantSlug: string;
}

export function LeadsPageClient({ initialData, tenantSlug }: LeadsPageClientProps) {
  const [leads, setLeads] = useState<Lead[]>(initialData.leads);
  const [users, setUsers] = useState(initialData.users);
  const [stats, setStats] = useState(initialData.stats);
  const [assignmentStats, setAssignmentStats] = useState(initialData.assignmentStats);
  const [pagination, setPagination] = useState(initialData.pagination);
  const [loading, setLoading] = useState(false);

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

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Create URL with new search params
  const createURL = useCallback((params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    return `?${newSearchParams.toString()}`;
  }, [searchParams]);

  // Refresh data from server
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const currentParams = Object.fromEntries(searchParams.entries());
      const response = await fetch(`/api/leads?${new URLSearchParams(currentParams).toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setLeads(data.data.leads);
        setStats(data.data.stats);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams, toast]);

  const handleUpdateLead = useCallback(async (leadId: string, leadData: CreateLeadRequest) => {
    try {
      const updatedLead = await updateLead(tenantSlug, leadId, leadData);
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
  }, [tenantSlug, toast]);

  const handleDeleteLead = useCallback((leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      setLeadToDelete(lead);
      setShowDeleteDialog(true);
    }
  }, [leads]);

  const confirmDeleteLead = useCallback(async () => {
    if (!leadToDelete) return;

    setIsDeleting(true);
    try {
      await deleteLead(tenantSlug, leadToDelete.id);
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
  }, [leadToDelete, tenantSlug, toast]);

  const cancelDeleteLead = useCallback(() => {
    setShowDeleteDialog(false);
    setLeadToDelete(null);
  }, []);

  const handleImportLeads = useCallback(async (file: File) => {
    try {
      const result = await importLeads(tenantSlug, file);
      setShowImportModal(false);
      toast({
        title: "Success",
        description: `${result.imported} leads imported successfully`,
      });
      await refreshData();
    } catch (error) {
      console.error("Error importing leads:", error);
      toast({
        title: "Error",
        description: "Failed to import leads",
        variant: "destructive",
      });
    }
  }, [tenantSlug, toast, refreshData]);

  const handleAssignLeads = useCallback(async (config: AssignmentConfig) => {
    try {
      const result = await assignLeads(tenantSlug, config);
      setShowAssignmentModal(false);
      toast({
        title: "Success",
        description: `${result.assigned} leads assigned successfully`,
      });
      await refreshData();
    } catch (error) {
      console.error("Error assigning leads:", error);
      toast({
        title: "Error",
        description: "Failed to assign leads",
        variant: "destructive",
      });
    }
  }, [tenantSlug, toast, refreshData]);

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
    const newURL = createURL({ page: page.toString() });
    router.push(newURL);
  }, [createURL, router]);

  const handleFiltersChange = useCallback((newFilters: Record<string, string>) => {
    const newURL = createURL({ ...newFilters, page: "1" });
    router.push(newURL);
  }, [createURL, router]);

  const handleResetFilters = useCallback(() => {
    router.push("?");
  }, [router]);

  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-gray-100 p-6">
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
          filters={{
            search: searchParams.get("search") || "",
            status: searchParams.get("status") || "",
            source: searchParams.get("source") || "",
            assigneeId: searchParams.get("assigneeId") || "",
          }}
          onFiltersChange={handleFiltersChange}
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
          onCreateLead={async () => {
            await refreshData();
            setShowLeadForm(false);
            toast({
              title: "Success",
              description: "Lead created successfully",
            });
          }}
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
