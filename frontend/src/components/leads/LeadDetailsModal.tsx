"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Phone,
    Mail,
    User,
    Calendar,
    MessageSquare,
    Plus,
    Edit,
    Trash2
} from "lucide-react";
import { Lead, getLeadNotes, addLeadNote } from "@/lib/api/leads";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/stores/auth";

interface LeadDetailsModalProps {
    lead: Lead;
    onClose: () => void;
}

export function LeadDetailsModal({ lead, onClose }: LeadDetailsModalProps) {
    const [notes, setNotes] = useState<any[]>([]);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: lead.name,
        email: lead.email || "",
        phone: lead.phone || "",
        source: lead.source || "",
        status: lead.status,
        score: lead.score,
    });
    const { currentTenantSlug } = useAuthStore();

    const { toast } = useToast();

    useEffect(() => {
        loadNotes();
    }, [lead.id]);

    const loadNotes = async () => {
        if (!currentTenantSlug) return;

        try {
            const notesData = await getLeadNotes(currentTenantSlug, lead.id);
            setNotes(notesData);
        } catch (error) {
            console.error("Error loading notes:", error);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        try {
            setLoading(true);
            await addLeadNote("demo-institution", lead.id, { note: newNote });
            setNewNote("");
            loadNotes(); // Refresh notes
            toast({
                title: "Success",
                description: "Note added successfully",
            });
        } catch (error) {
            console.error("Error adding note:", error);
            toast({
                title: "Error",
                description: "Failed to add note",
                variant: "destructive",
            });
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
            CONVERTED: "bg-emerald-100 text-emerald-800",
            LOST: "bg-red-100 text-red-800",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        if (score >= 40) return "text-orange-600";
        return "text-red-600";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{lead.name}</CardTitle>
                            <p className="text-gray-600">Lead Details</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                                <Edit className="w-4 h-4 mr-2" />
                                {editing ? "Cancel" : "Edit"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contact Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Contact Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.name}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                                />
                                            ) : (
                                                <p className="text-sm">{lead.name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            {editing ? (
                                                <Input
                                                    type="email"
                                                    value={editData.email}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm">{lead.email || "N/A"}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.phone}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm">{lead.phone || "N/A"}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Source</Label>
                                            {editing ? (
                                                <Input
                                                    value={editData.source}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, source: e.target.value }))}
                                                />
                                            ) : (
                                                <p className="text-sm">{lead.source || "N/A"}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Lead Status & Assignment */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Status & Assignment</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            {editing ? (
                                                <select
                                                    value={editData.status}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                                                    className="w-full p-2 border rounded-md"
                                                >
                                                    <option value="NEW">New</option>
                                                    <option value="CONTACTED">Contacted</option>
                                                    <option value="QUALIFIED">Qualified</option>
                                                    <option value="INTERESTED">Interested</option>
                                                    <option value="APPLICATION_STARTED">Application Started</option>
                                                    <option value="DOCUMENTS_SUBMITTED">Documents Submitted</option>
                                                    <option value="UNDER_REVIEW">Under Review</option>
                                                    <option value="ADMITTED">Admitted</option>
                                                    <option value="ENROLLED">Enrolled</option>
                                                    <option value="REJECTED">Rejected</option>
                                                    <option value="LOST">Lost</option>
                                                </select>
                                            ) : (
                                                <Badge className={getStatusColor(lead.status)}>
                                                    {lead.status}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Score</Label>
                                            {editing ? (
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={editData.score}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                                                />
                                            ) : (
                                                <p className={`text-lg font-medium ${getScoreColor(lead.score)}`}>
                                                    {lead.score}/100
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Assignee</Label>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">
                                                    {lead.assignee ? (
                                                        `${lead.assignee.firstName} ${lead.assignee.lastName}`
                                                    ) : (
                                                        "Unassigned"
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Created</Label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm">
                                                    {new Date(lead.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {editing && (
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setEditing(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => {
                                        // Handle save logic here
                                        setEditing(false);
                                    }}>
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="notes" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Notes & Comments</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Add Note Form */}
                                    <div className="space-y-2">
                                        <Label>Add Note</Label>
                                        <div className="flex gap-2">
                                            <Textarea
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                                placeholder="Add a note about this lead..."
                                                rows={3}
                                                className="flex-1"
                                            />
                                            <Button
                                                onClick={handleAddNote}
                                                disabled={loading || !newNote.trim()}
                                                className="self-end"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Notes List */}
                                    <div className="space-y-3">
                                        {notes.length === 0 ? (
                                            <p className="text-gray-500 text-center py-4">No notes yet</p>
                                        ) : (
                                            notes.map((note) => (
                                                <div key={note.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <MessageSquare className="w-4 h-4 text-gray-500" />
                                                            <span className="font-medium">
                                                                {note.user.firstName} {note.user.lastName}
                                                            </span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {note.user.role}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(note.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{note.note}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="activity" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Activity History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-center py-8 text-gray-500">
                                            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                            <p>Activity history will be displayed here</p>
                                            <p className="text-sm">This feature is coming soon</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
