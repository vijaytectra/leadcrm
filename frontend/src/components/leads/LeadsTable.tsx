"use client";

import { memo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, Eye, Edit2, Trash2, MoreHorizontal, User, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lead } from "@/lib/api/leads";
import { LeadsTableSkeleton } from "./LeadsTableSkeleton";

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onPageChange: (page: number) => void;
}

const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-blue-100 text-blue-800 border-blue-200",
      CONTACTED: "bg-yellow-100 text-yellow-800 border-yellow-200",
      QUALIFIED: "bg-green-100 text-green-800 border-green-200",
      INTERESTED: "bg-purple-100 text-purple-800 border-purple-200",
      CONVERTED: "bg-emerald-100 text-emerald-800 border-emerald-200",
      LOST: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <Badge className={`${getStatusColor(status)} font-medium px-2 py-1 text-xs border`}>
      {status}
    </Badge>
  );
});

const LeadRow = memo(function LeadRow({
  lead,
  onView,
  onEdit,
  onDelete
}: {
  lead: Lead;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    if (score >= 40) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const handleView = useCallback(() => onView(lead), [onView, lead]);
  const handleEdit = useCallback(() => onEdit(lead), [onEdit, lead]);
  const handleDelete = useCallback(() => onDelete(lead.id), [onDelete, lead.id]);

  return (
    <TableRow className="hover:bg-gray-50 transition-colors">
      <TableCell className="font-medium text-gray-900">{lead.name}</TableCell>
      <TableCell>
        <div className="space-y-1">
          {lead.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-3 h-3 mr-2" />
              <span className="truncate max-w-[200px]">{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-3 h-3 mr-2" />
              {lead.phone}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-gray-600">{lead.source || "N/A"}</span>
      </TableCell>
      <TableCell>
        <StatusBadge status={lead.status} />
      </TableCell>
      <TableCell>
        <div className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${getScoreColor(lead.score)}`}>
          {lead.score}
        </div>
      </TableCell>
      <TableCell>
        {lead.assignee ? (
          <div className="text-sm text-gray-900">
            {lead.assignee.firstName} {lead.assignee.lastName}
          </div>
        ) : (
          <span className="text-sm text-gray-500 italic">Unassigned</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {new Date(lead.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={handleView} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

export const LeadsTable = memo(function LeadsTable({
  leads,
  loading,
  pagination,
  onViewLead,
  onEditLead,
  onDeleteLead,
  onPageChange,
}: LeadsTableProps) {
  if (loading) {
    return <LeadsTableSkeleton />;
  }

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-lg font-semibold">
          Leads ({pagination.total})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="font-semibold text-gray-900">Name</TableHead>
                <TableHead className="font-semibold text-gray-900">Contact</TableHead>
                <TableHead className="font-semibold text-gray-900">Source</TableHead>
                <TableHead className="font-semibold text-gray-900">Status</TableHead>
                <TableHead className="font-semibold text-gray-900">Score</TableHead>
                <TableHead className="font-semibold text-gray-900">Assignee</TableHead>
                <TableHead className="font-semibold text-gray-900">Created</TableHead>
                <TableHead className="font-semibold text-gray-900 w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-12">
                    <div className="text-gray-500">
                      <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium">No leads found</h3>
                      <p className="text-sm">Get started by adding your first lead.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    onView={onViewLead}
                    onEdit={onEditLead}
                    onDelete={onDeleteLead}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Enhanced Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center p-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
              <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
              <span className="font-medium">{pagination.total}</span> results
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => onPageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(pagination.pages, 5) }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <Button
                      key={page}
                      variant={pagination.page === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => onPageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
