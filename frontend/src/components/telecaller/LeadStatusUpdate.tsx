"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadStatusUpdateProps {
  tenantSlug: string;
  leadId: string;
  leadName: string;
  currentStatus: string;
  onUpdate?: (updatedLead: any) => void;
  onCancel?: () => void;
}

const statusFlow = {
  NEW: ["CONTACTED", "LOST"],
  CONTACTED: ["QUALIFIED", "INTERESTED", "NOT_INTERESTED", "LOST"],
  QUALIFIED: ["INTERESTED", "APPLICATION_STARTED", "LOST"],
  INTERESTED: ["APPLICATION_STARTED", "DOCUMENTS_SUBMITTED", "LOST"],
  APPLICATION_STARTED: ["DOCUMENTS_SUBMITTED", "UNDER_REVIEW", "LOST"],
  DOCUMENTS_SUBMITTED: ["UNDER_REVIEW", "ADMITTED", "REJECTED"],
  UNDER_REVIEW: ["ADMITTED", "REJECTED"],
  ADMITTED: ["ENROLLED", "LOST"],
  ENROLLED: [],
  REJECTED: [],
  LOST: []
};

export function LeadStatusUpdate({
  tenantSlug,
  leadId,
  leadName,
  currentStatus,
  onUpdate,
  onCancel
}: LeadStatusUpdateProps) {
  const [formData, setFormData] = useState({
    status: "",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // This would be replaced with actual API call
      // const response = await updateLeadStatus(tenantSlug, leadId, formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedLead = {
        id: leadId,
        name: leadName,
        status: formData.status,
        notes: formData.notes,
        updatedAt: new Date().toISOString()
      };

      onUpdate?.(updatedLead);
    } catch (error) {
      console.error("Failed to update lead status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-800 border-blue-200";
      case "CONTACTED": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "QUALIFIED": return "bg-purple-100 text-purple-800 border-purple-200";
      case "INTERESTED": return "bg-green-100 text-green-800 border-green-200";
      case "APPLICATION_STARTED": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "DOCUMENTS_SUBMITTED": return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "UNDER_REVIEW": return "bg-orange-100 text-orange-800 border-orange-200";
      case "ADMITTED": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "ENROLLED": return "bg-teal-100 text-teal-800 border-teal-200";
      case "REJECTED": return "bg-red-100 text-red-800 border-red-200";
      case "LOST": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "NEW": return <Clock className="h-4 w-4" />;
      case "CONTACTED": return <User className="h-4 w-4" />;
      case "QUALIFIED": return <CheckCircle className="h-4 w-4" />;
      case "INTERESTED": return <CheckCircle className="h-4 w-4" />;
      case "APPLICATION_STARTED": return <CheckCircle className="h-4 w-4" />;
      case "DOCUMENTS_SUBMITTED": return <CheckCircle className="h-4 w-4" />;
      case "UNDER_REVIEW": return <AlertCircle className="h-4 w-4" />;
      case "ADMITTED": return <CheckCircle className="h-4 w-4" />;
      case "ENROLLED": return <CheckCircle className="h-4 w-4" />;
      case "REJECTED": return <AlertCircle className="h-4 w-4" />;
      case "LOST": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "NEW": return "Lead has been created but not yet contacted";
      case "CONTACTED": return "Initial contact has been made with the lead";
      case "QUALIFIED": return "Lead meets the basic qualification criteria";
      case "INTERESTED": return "Lead has shown interest in the program";
      case "APPLICATION_STARTED": return "Lead has started the application process";
      case "DOCUMENTS_SUBMITTED": return "Lead has submitted required documents";
      case "UNDER_REVIEW": return "Application is being reviewed by the team";
      case "ADMITTED": return "Lead has been admitted to the program";
      case "ENROLLED": return "Lead has completed enrollment";
      case "REJECTED": return "Application has been rejected";
      case "LOST": return "Lead is no longer interested or qualified";
      default: return "";
    }
  };

  const availableStatuses = statusFlow[currentStatus as keyof typeof statusFlow] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Update Lead Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lead Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Lead Information</h4>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{leadName}</div>
                <div className="text-sm text-gray-500">Lead ID: {leadId}</div>
              </div>
              <Badge className={getStatusColor(currentStatus)}>
                {getStatusIcon(currentStatus)}
                <span className="ml-1">{currentStatus.replace("_", " ")}</span>
              </Badge>
            </div>
          </div>

          {/* Current Status Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Current Status</h4>
            <div className="flex items-center space-x-2">
              {getStatusIcon(currentStatus)}
              <span className="font-medium text-blue-900">
                {currentStatus.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {getStatusDescription(currentStatus)}
            </p>
          </div>

          {/* Status Update */}
          <div>
            <Label htmlFor="status">New Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span>{status.replace("_", " ")}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.status && (
              <p className="text-sm text-gray-600 mt-2">
                {getStatusDescription(formData.status)}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Update Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Add notes about the status update..."
              rows={4}
            />
          </div>

          {/* Status Preview */}
          {formData.status && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Status Change Preview</h4>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(currentStatus)}>
                    {getStatusIcon(currentStatus)}
                    <span className="ml-1">{currentStatus.replace("_", " ")}</span>
                  </Badge>
                  <span className="text-gray-400">→</span>
                  <Badge className={getStatusColor(formData.status)}>
                    {getStatusIcon(formData.status)}
                    <span className="ml-1">{formData.status.replace("_", " ")}</span>
                  </Badge>
                </div>
              </div>
              {formData.notes && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <div className="text-sm text-gray-600">
                    <strong>Notes:</strong> {formData.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.status}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}