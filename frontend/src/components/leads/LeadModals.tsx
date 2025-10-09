"use client";

import { memo } from "react";
import { Lead, CreateLeadRequest, AssignmentConfig } from "@/lib/api/leads";
import { LeadForm } from "@/components/leads/LeadForm";
import { LeadImportModal } from "@/components/leads/LeadImportModal";
import { AssignmentModal } from "@/components/leads/AssignmentModal";
import { LeadDetailsModal } from "@/components/leads/LeadDetailsModal";

interface LeadModalsProps {
  showLeadForm: boolean;
  showImportModal: boolean;
  showAssignmentModal: boolean;
  showLeadDetails: boolean;
  editingLead: Lead | null;
  selectedLead: Lead | null;
  users: Array<{ id: string; firstName: string; lastName: string; email: string; role: string }>;
  assignmentStats: any;
  onCreateLead: (data: CreateLeadRequest) => void;
  onUpdateLead: (leadId: string, data: CreateLeadRequest) => void;
  onImportLeads: (file: File) => void;
  onAssignLeads: (config: AssignmentConfig) => void;
  onCloseLeadForm: () => void;
  onCloseImportModal: () => void;
  onCloseAssignmentModal: () => void;
  onCloseLeadDetails: () => void;
}

export const LeadModals = memo(function LeadModals({
  showLeadForm,
  showImportModal,
  showAssignmentModal,
  showLeadDetails,
  editingLead,
  selectedLead,
  users,
  assignmentStats,
  onCreateLead,
  onUpdateLead,
  onImportLeads,
  onAssignLeads,
  onCloseLeadForm,
  onCloseImportModal,
  onCloseAssignmentModal,
  onCloseLeadDetails,
}: LeadModalsProps) {
  return (
    <>
      {showLeadForm && (
        <LeadForm
          lead={editingLead}
          users={users}
          onSave={editingLead ? (data) => onUpdateLead(editingLead.id, data) : onCreateLead}
          onClose={onCloseLeadForm}
        />
      )}

      {showImportModal && (
        <LeadImportModal
          onImport={onImportLeads}
          onClose={onCloseImportModal}
        />
      )}

      {showAssignmentModal && (
        <AssignmentModal
          users={users}
          assignmentStats={assignmentStats}
          onAssign={onAssignLeads}
          onClose={onCloseAssignmentModal}
        />
      )}

      {showLeadDetails && selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={onCloseLeadDetails}
        />
      )}
    </>
  );
});
