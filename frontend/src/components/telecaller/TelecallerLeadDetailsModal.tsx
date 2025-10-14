"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    X,
    User,
    Mail,
    Phone,
    Tag,
    Target,
    Users,
    Clock,
    Activity,
    MessageSquare,
    Edit,
    Trash2,
    Plus,
    Save
} from "lucide-react";
import { Lead } from "@/lib/api/leads";
import { getLead, updateLead, addLeadNote, getLeadNotes } from "@/lib/api/leads";
import { getLeadActivities, LeadActivity } from "@/lib/api/telecaller";
import { toast } from "sonner";

interface TelecallerLeadDetailsModalProps {
    leadId: string | null;
    tenantSlug: string;
    onClose: () => void;
    onLeadUpdated?: (lead: Lead) => void;
}

interface LeadNote {
    id: string;
    note: string;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
        role: string;
    };
}

// Remove the old ActivityItem interface since we're using LeadActivity from the API

export const TelecallerLeadDetailsModal = memo(function TelecallerLeadDetailsModal({
    leadId,
    tenantSlug,
    onClose,
    onLeadUpdated
}: TelecallerLeadDetailsModalProps) {
    const [lead, setLead] = useState<Lead | null>(null);
    const [notes, setNotes] = useState<LeadNote[]>([]);
    const [activities, setActivities] = useState<LeadActivity[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("details");

    // Form states
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        phone: "",
        source: "",
        status: "",
        score: 0
    });

    // Notes states
    const [newNote, setNewNote] = useState("");
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editingNoteText, setEditingNoteText] = useState("");

    const fetchLeadDetails = useCallback(async () => {
        if (!leadId) return;

        setLoading(true);
        try {
            const [leadData, notesData, activitiesData] = await Promise.all([
                getLead(tenantSlug, leadId),
                getLeadNotes(tenantSlug, leadId),
                getLeadActivities(tenantSlug, leadId)
            ]);

            setLead(leadData);
            setNotes(notesData);
            setEditForm({
                name: leadData.name,
                email: leadData.email || "",
                phone: leadData.phone || "",
                source: leadData.source || "",
                status: leadData.status,
                score: leadData.score
            });

            // Use real activities from backend
            if (activitiesData.success) {
                setActivities(activitiesData.data);
            } else {
                console.error("Failed to fetch activities:", activitiesData.error);
                setActivities([]);
            }
        } catch (error) {
            console.error("Error fetching lead details:", error);
            toast.error("Failed to load lead details");
        } finally {
            setLoading(false);
        }
    }, [leadId, tenantSlug]);

    useEffect(() => {
        if (leadId) {
            fetchLeadDetails();
        }
    }, [leadId, fetchLeadDetails]);

    const handleSaveLead = async () => {
        if (!lead || !leadId) return;

        setLoading(true);
        try {
            const updatedLead = await updateLead(tenantSlug, leadId, editForm);
            setLead(updatedLead);
            setIsEditing(false);
            onLeadUpdated?.(updatedLead);
            toast.success("Lead updated successfully");
        } catch (error) {
            console.error("Error updating lead:", error);
            toast.error("Failed to update lead");
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim() || !leadId) return;

        setLoading(true);
        try {
            const newNoteData = await addLeadNote(tenantSlug, leadId, { note: newNote });
            setNotes(prev => [newNoteData, ...prev]);
            setNewNote("");
            toast.success("Note added successfully");
        } catch (error) {
            console.error("Error adding note:", error);
            toast.error("Failed to add note");
        } finally {
            setLoading(false);
        }
    };

    const handleEditNote = (noteId: string, currentText: string) => {
        setEditingNoteId(noteId);
        setEditingNoteText(currentText);
    };

    const handleSaveNote = async () => {
        if (!editingNoteId || !editingNoteText.trim()) return;

        setLoading(true);
        try {
            // Note: This would require a backend endpoint for updating notes
            // For now, we'll just update the local state
            setNotes(prev => prev.map(note =>
                note.id === editingNoteId
                    ? { ...note, note: editingNoteText }
                    : note
            ));
            setEditingNoteId(null);
            setEditingNoteText("");
            toast.success("Note updated successfully");
        } catch (error) {
            console.error("Error updating note:", error);
            toast.error("Failed to update note");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm("Are you sure you want to delete this note?")) return;

        setLoading(true);
        try {
            // Note: This would require a backend endpoint for deleting notes
            // For now, we'll just update the local state
            setNotes(prev => prev.filter(note => note.id !== noteId));
            toast.success("Note deleted successfully");
        } catch (error) {
            console.error("Error deleting note:", error);
            toast.error("Failed to delete note");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            NEW: "bg-blue-100 text-blue-800",
            CONTACTED: "bg-yellow-100 text-yellow-800",
            QUALIFIED: "bg-green-100 text-green-800",
            INTERESTED: "bg-purple-100 text-purple-800",
            APPLICATION_STARTED: "bg-indigo-100 text-indigo-800",
            DOCUMENTS_SUBMITTED: "bg-cyan-100 text-cyan-800",
            UNDER_REVIEW: "bg-orange-100 text-orange-800",
            ADMITTED: "bg-emerald-100 text-emerald-800",
            ENROLLED: "bg-teal-100 text-teal-800",
            REJECTED: "bg-red-100 text-red-800",
            LOST: "bg-gray-100 text-gray-800"
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, string> = {
            NEW: "🆕",
            CONTACTED: "📞",
            QUALIFIED: "✅",
            INTERESTED: "💡",
            APPLICATION_STARTED: "📝",
            DOCUMENTS_SUBMITTED: "📄",
            UNDER_REVIEW: "🔍",
            ADMITTED: "🎓",
            ENROLLED: "📚",
            REJECTED: "❌",
            LOST: "💔"
        };
        return icons[status] || "📋";
    };

    if (!leadId) return null;

    console.log("Activities", activities);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white shadow-2xl">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold text-white flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Lead Details
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>

                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    <CardContent className="p-6">
                        {loading && !lead ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : lead ? (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="details" className="flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        Details
                                    </TabsTrigger>
                                    <TabsTrigger value="notes" className="flex items-center">
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Notes ({notes.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="activity" className="flex items-center">
                                        <Activity className="w-4 h-4 mr-2" />
                                        Activity ({activities.length})
                                    </TabsTrigger>
                                </TabsList>

                                {/* Details Tab */}
                                <TabsContent value="details" className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">Lead Information</h3>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditing(!isEditing)}
                                            disabled={loading}
                                        >
                                            {isEditing ? (
                                                <>
                                                    <X className="w-4 h-4 mr-2" />
                                                    Cancel
                                                </>
                                            ) : (
                                                <>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name *</Label>
                                                    <Input
                                                        id="name"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                        className="text-black"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={editForm.email}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                                        className="text-black"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Phone</Label>
                                                    <Input
                                                        id="phone"
                                                        value={editForm.phone}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                                        className="text-black"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="source">Source</Label>
                                                    <Input
                                                        id="source"
                                                        value={editForm.source}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, source: e.target.value }))}
                                                        className="text-black"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="status">Status</Label>
                                                    <Select
                                                        value={editForm.status}
                                                        onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                                                    >
                                                        <SelectTrigger className="text-black">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="NEW">🆕 New</SelectItem>
                                                            <SelectItem value="CONTACTED">📞 Contacted</SelectItem>
                                                            <SelectItem value="QUALIFIED">✅ Qualified</SelectItem>
                                                            <SelectItem value="INTERESTED">💡 Interested</SelectItem>
                                                            <SelectItem value="APPLICATION_STARTED">📝 Application Started</SelectItem>
                                                            <SelectItem value="DOCUMENTS_SUBMITTED">📄 Documents Submitted</SelectItem>
                                                            <SelectItem value="UNDER_REVIEW">🔍 Under Review</SelectItem>
                                                            <SelectItem value="ADMITTED">🎓 Admitted</SelectItem>
                                                            <SelectItem value="ENROLLED">📚 Enrolled</SelectItem>
                                                            <SelectItem value="REJECTED">❌ Rejected</SelectItem>
                                                            <SelectItem value="LOST">💔 Lost</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="score">Score (0-100)</Label>
                                                    <Input
                                                        id="score"
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={editForm.score}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                                                        className="text-black"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsEditing(false)}
                                                    disabled={loading}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleSaveLead}
                                                    disabled={loading}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-3">
                                                    <User className="w-5 h-5 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Name</p>
                                                        <p className="font-medium">{lead.name}</p>
                                                    </div>
                                                </div>
                                                {lead.email && (
                                                    <div className="flex items-center space-x-3">
                                                        <Mail className="w-5 h-5 text-gray-500" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Email</p>
                                                            <p className="font-medium">{lead.email}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {lead.phone && (
                                                    <div className="flex items-center space-x-3">
                                                        <Phone className="w-5 h-5 text-gray-500" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Phone</p>
                                                            <p className="font-medium">{lead.phone}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {lead.source && (
                                                    <div className="flex items-center space-x-3">
                                                        <Tag className="w-5 h-5 text-gray-500" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Source</p>
                                                            <p className="font-medium">{lead.source}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-3">
                                                    <Target className="w-5 h-5 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Status</p>
                                                        <Badge className={getStatusColor(lead.status)}>
                                                            {getStatusIcon(lead.status)} {lead.status.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Users className="w-5 h-5 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Score</p>
                                                        <p className="font-medium">{lead.score}/100</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <Clock className="w-5 h-5 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm text-gray-500">Created</p>
                                                        <p className="font-medium">{new Date(lead.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                {lead.assignee && (
                                                    <div className="flex items-center space-x-3">
                                                        <Users className="w-5 h-5 text-gray-500" />
                                                        <div>
                                                            <p className="text-sm text-gray-500">Assigned To</p>
                                                            <p className="font-medium">{lead.assignee.firstName} {lead.assignee.lastName}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Notes Tab */}
                                <TabsContent value="notes" className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">Notes</h3>
                                        </div>

                                        {/* Add New Note */}
                                        <div className="space-y-3">
                                            <Label htmlFor="newNote">Add New Note</Label>
                                            <div className="flex space-x-2">
                                                <Textarea
                                                    id="newNote"
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                    placeholder="Add a note about this lead..."
                                                    className="flex-1"
                                                    rows={3}
                                                />
                                                <Button
                                                    onClick={handleAddNote}
                                                    disabled={!newNote.trim() || loading}
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Notes List */}
                                        <div className="space-y-3">
                                            {notes.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                    <p>No notes yet</p>
                                                </div>
                                            ) : (
                                                notes.map((note) => (
                                                    <Card key={note.id} className="p-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                {editingNoteId === note.id ? (
                                                                    <div className="space-y-2">
                                                                        <Textarea
                                                                            value={editingNoteText}
                                                                            onChange={(e) => setEditingNoteText(e.target.value)}
                                                                            className="text-black"
                                                                            rows={3}
                                                                        />
                                                                        <div className="flex space-x-2">
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={handleSaveNote}
                                                                                disabled={loading}
                                                                                className="bg-green-600 hover:bg-green-700"
                                                                            >
                                                                                <Save className="w-4 h-4 mr-1" />
                                                                                Save
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => {
                                                                                    setEditingNoteId(null);
                                                                                    setEditingNoteText("");
                                                                                }}
                                                                            >
                                                                                Cancel
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <p className="text-gray-900">{note.note}</p>
                                                                        <div className="flex items-center mt-2 text-sm text-gray-500">
                                                                            <span>{note.user.firstName} {note.user.lastName}</span>
                                                                            <span className="mx-2">•</span>
                                                                            <span>{new Date(note.createdAt).toLocaleString()}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {editingNoteId !== note.id && (
                                                                <div className="flex space-x-1 ml-4">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => handleEditNote(note.id, note.note)}
                                                                        className="text-gray-500 hover:text-blue-600"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => handleDeleteNote(note.id)}
                                                                        className="text-gray-500 hover:text-red-600"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Activity Tab */}
                                <TabsContent value="activity" className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Activity Timeline</h3>

                                        {activities.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                <p>No activity yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {activities.map((activity, index) => (
                                                    <div key={activity.id} className="flex items-start space-x-4">
                                                        <div className="flex-shrink-0">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'AUDIT' ? 'bg-blue-100' :
                                                                activity.type === 'CALL' ? 'bg-green-100' :
                                                                    'bg-purple-100'
                                                                }`}>
                                                                {activity.type === 'AUDIT' ? (
                                                                    <Activity className="w-4 h-4 text-blue-600" />
                                                                ) : activity.type === 'CALL' ? (
                                                                    <Phone className="w-4 h-4 text-green-600" />
                                                                ) : (
                                                                    <Clock className="w-4 h-4 text-purple-600" />
                                                                )}
                                                            </div>
                                                            {index < activities.length - 1 && (
                                                                <div className="w-px h-8 bg-gray-200 ml-4 mt-2"></div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="bg-gray-50 rounded-lg p-4">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {activity.description}
                                                                </p>
                                                                {activity.callData && (
                                                                    <div className="mt-2 text-xs text-gray-600">
                                                                        <p>Type: {activity.callData.callType} | Status: {activity.callData.status}</p>
                                                                        {activity.callData.outcome && <p>Outcome: {activity.callData.outcome}</p>}
                                                                        {activity.callData.duration && <p>Duration: {activity.callData.duration}s</p>}
                                                                    </div>
                                                                )}
                                                                {activity.followUpData && (
                                                                    <div className="mt-2 text-xs text-gray-600">
                                                                        <p>Type: {activity.followUpData.type} | Priority: {activity.followUpData.priority}</p>
                                                                        <p>Scheduled: {new Date(activity.followUpData.scheduledAt).toLocaleString()}</p>
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                                                    <span>{activity.user.firstName} {activity.user.lastName}</span>
                                                                    <span className="mx-2">•</span>
                                                                    <span>{new Date(activity.createdAt).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>Lead not found</p>
                            </div>
                        )}
                    </CardContent>
                </div>
            </Card>
        </div>
    );
});
