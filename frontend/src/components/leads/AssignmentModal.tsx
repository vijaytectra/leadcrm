"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, BarChart3, AlertCircle, CheckCircle } from "lucide-react";
import { AssignmentConfig } from "@/lib/api/leads";

interface AssignmentModalProps {
    users: any[];
    assignmentStats: any;
    onAssign: (config: AssignmentConfig) => void;
    onClose: () => void;
}

export function AssignmentModal({ users, assignmentStats, onAssign, onClose }: AssignmentModalProps) {
    const [config, setConfig] = useState<AssignmentConfig>({
        algorithm: "ROUND_ROBIN",
        autoAssign: true,
        maxLeadsPerUser: 50,
        skillRequirements: {},
    });
    const [assigning, setAssigning] = useState(false);

    const telecallers = users.filter(user => user.role === "TELECALLER");

    const handleAssign = async () => {
        setAssigning(true);
        try {
            await onAssign(config);
        } catch (error) {
            console.error("Assignment error:", error);
        } finally {
            setAssigning(false);
        }
    };

    const getAlgorithmDescription = (algorithm: string) => {
        switch (algorithm) {
            case "ROUND_ROBIN":
                return "Distributes leads equally among all telecallers in rotation";
            case "LOAD_BASED":
                return "Assigns leads to telecallers with the least current workload";
            case "SKILL_BASED":
                return "Matches leads to telecallers based on their skills and expertise";
            default:
                return "";
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <CardTitle>Auto-Assign Leads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Current Stats */}
                    {assignmentStats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Unassigned Leads</p>
                                            <p className="text-2xl font-bold">{assignmentStats.unassignedLeads || 0}</p>
                                        </div>
                                        <Users className="w-8 h-8 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Active Telecallers</p>
                                            <p className="text-2xl font-bold">{telecallers.length}</p>
                                        </div>
                                        <BarChart3 className="w-8 h-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Avg Load</p>
                                            <p className="text-2xl font-bold">
                                                {assignmentStats.telecallers?.length > 0
                                                    ? Math.round(
                                                        assignmentStats.telecallers.reduce(
                                                            (sum: number, t: any) => sum + t.currentLoad,
                                                            0
                                                        ) / assignmentStats.telecallers.length
                                                    )
                                                    : 0}
                                            </p>
                                        </div>
                                        <BarChart3 className="w-8 h-8 text-purple-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Telecaller Workload */}
                    {assignmentStats?.telecallers && (
                        <div>
                            <h4 className="font-medium mb-3">Current Telecaller Workload</h4>
                            <div className="space-y-2">
                                {assignmentStats.telecallers.map((telecaller: any) => (
                                    <div key={telecaller.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{telecaller.name}</p>
                                            <p className="text-sm text-gray-600">{telecaller.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={telecaller.currentLoad > 20 ? "destructive" : "secondary"}>
                                                {telecaller.currentLoad} leads
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assignment Configuration */}
                    <div className="space-y-4">
                        <h4 className="font-medium">Assignment Configuration</h4>

                        <div className="space-y-2">
                            <Label htmlFor="algorithm">Assignment Algorithm</Label>
                            <Select
                                value={config.algorithm}
                                onValueChange={(value: any) => setConfig(prev => ({ ...prev, algorithm: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                                    <SelectItem value="LOAD_BASED">Load Based</SelectItem>
                                    <SelectItem value="SKILL_BASED">Skill Based</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-gray-600">
                                {getAlgorithmDescription(config.algorithm)}
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="autoAssign">Auto-assign new leads</Label>
                                <p className="text-sm text-gray-600">
                                    Automatically assign new leads as they come in
                                </p>
                            </div>
                            <Switch
                                id="autoAssign"
                                checked={config.autoAssign}
                                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoAssign: checked }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="maxLeads">Maximum leads per telecaller</Label>
                            <Input
                                id="maxLeads"
                                type="number"
                                min="1"
                                max="100"
                                value={config.maxLeadsPerUser}
                                onChange={(e) => setConfig(prev => ({
                                    ...prev,
                                    maxLeadsPerUser: parseInt(e.target.value) || 50
                                }))}
                            />
                        </div>
                    </div>

                    {/* Algorithm Info */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {config.algorithm === "ROUND_ROBIN" &&
                                "Round Robin ensures fair distribution by rotating through telecallers in order."}
                            {config.algorithm === "LOAD_BASED" &&
                                "Load Based assigns leads to telecallers with the lowest current workload."}
                            {config.algorithm === "SKILL_BASED" &&
                                "Skill Based matching requires additional configuration of telecaller skills and lead requirements."}
                        </AlertDescription>
                    </Alert>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={assigning || !assignmentStats?.unassignedLeads}
                        >
                            {assigning ? "Assigning..." : `Assign ${assignmentStats?.unassignedLeads || 0} Leads`}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
