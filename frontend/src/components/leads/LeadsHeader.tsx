"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Users } from "lucide-react";

interface LeadsHeaderProps {
  onShowImportModal: () => void;
  onShowAssignmentModal: () => void;
  onShowLeadForm: () => void;
}

export const LeadsHeader = memo(function LeadsHeader({ 
  onShowImportModal, 
  onShowAssignmentModal, 
  onShowLeadForm 
}: LeadsHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Lead Management
          </h1>
          <p className="text-gray-600 mt-1">Manage and track your leads efficiently</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onShowImportModal} variant="outline" className="hover:bg-gray-50">
            <Upload className="w-4 h-4 mr-2" />
            Import Leads
          </Button>
          <Button onClick={onShowAssignmentModal} variant="outline" className="hover:bg-gray-50">
            <Users className="w-4 h-4 mr-2" />
            Auto Assign
          </Button>
          <Button onClick={onShowLeadForm} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>
    </div>
  );
});
