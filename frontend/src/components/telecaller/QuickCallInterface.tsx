"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Clock, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  name: string;
  phone: string;
  status: string;
  lastContact: string | null;
  priority: string;
  notes: string;
}

interface RecentCall {
  id: string;
  leadName: string;
  phone: string;
  duration: number;
  outcome: string;
  createdAt: string;
}

interface QuickCallData {
  availableLeads: Lead[];
  selectedLead: Lead | null;
  recentCalls: RecentCall[];
}

interface QuickCallInterfaceProps {
  tenantSlug: string;
  initialData: QuickCallData;
  selectedLeadId?: string;
}

type CallStatus = "idle" | "calling" | "connected" | "ended";

export function QuickCallInterface({ 
  tenantSlug, 
  initialData, 
  selectedLeadId 
}: QuickCallInterfaceProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(
    selectedLeadId ? initialData.selectedLead : null
  );
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "connected" && callStartTime) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus, callStartTime]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = () => {
    if (!selectedLead) return;
    
    setCallStatus("calling");
    // Simulate call initiation
    setTimeout(() => {
      setCallStatus("connected");
      setCallStartTime(new Date());
    }, 2000);
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    setCallDuration(0);
    setCallStartTime(null);
    
    // Reset after a moment
    setTimeout(() => {
      setCallStatus("idle");
    }, 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-800 border-blue-200";
      case "CONTACTED": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "INTERESTED": return "bg-green-100 text-green-800 border-green-200";
      case "QUALIFIED": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case "INTERESTED":
      case "QUALIFIED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "NO_ANSWER":
      case "BUSY":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quick Call Interface</h1>
          <p className="text-gray-600 mt-1">Start calling leads directly from your dashboard</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {initialData.availableLeads.length} leads available
          </Badge>
        </div>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Select Lead</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {initialData.availableLeads.map((lead) => (
                <div
                  key={lead.id}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer transition-all duration-200",
                    selectedLead?.id === lead.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {lead.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Badge className={cn("text-xs", getPriorityColor(lead.priority))}>
                        {lead.priority}
                      </Badge>
                      <Badge className={cn("text-xs", getStatusColor(lead.status))}>
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                  {lead.notes && (
                    <p className="text-sm text-gray-600 mt-2">{lead.notes}</p>
                  )}
                  {lead.lastContact && (
                    <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Last contact: {new Date(lead.lastContact).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PhoneCall className="h-5 w-5" />
              <span>Call Interface</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedLead ? (
              <div className="space-y-6">
                {/* Selected Lead Info */}
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-4">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                      {selectedLead.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedLead.name}</h3>
                  <p className="text-gray-600">{selectedLead.phone}</p>
                  <div className="flex justify-center space-x-2 mt-2">
                    <Badge className={getPriorityColor(selectedLead.priority)}>
                      {selectedLead.priority}
                    </Badge>
                    <Badge className={getStatusColor(selectedLead.status)}>
                      {selectedLead.status}
                    </Badge>
                  </div>
                </div>

                {/* Call Status */}
                <div className="text-center">
                  {callStatus === "idle" && (
                    <div className="text-gray-500">Ready to call</div>
                  )}
                  {callStatus === "calling" && (
                    <div className="text-blue-600 font-medium">Calling...</div>
                  )}
                  {callStatus === "connected" && (
                    <div className="space-y-2">
                      <div className="text-green-600 font-medium">Connected</div>
                      <div className="text-2xl font-mono text-gray-900">
                        {formatDuration(callDuration)}
                      </div>
                    </div>
                  )}
                  {callStatus === "ended" && (
                    <div className="text-gray-500">Call ended</div>
                  )}
                </div>

                {/* Call Controls */}
                <div className="flex justify-center space-x-4">
                  {callStatus === "idle" && (
                    <Button
                      onClick={handleStartCall}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full"
                    >
                      <Phone className="h-5 w-5 mr-2" />
                      Start Call
                    </Button>
                  )}
                  {callStatus === "calling" && (
                    <Button
                      disabled
                      className="bg-blue-600 text-white px-6 py-3 rounded-full"
                    >
                      <PhoneCall className="h-5 w-5 mr-2 animate-pulse" />
                      Calling...
                    </Button>
                  )}
                  {callStatus === "connected" && (
                    <Button
                      onClick={handleEndCall}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full"
                    >
                      <PhoneOff className="h-5 w-5 mr-2" />
                      End Call
                    </Button>
                  )}
                </div>

                {/* Call Notes */}
                {selectedLead.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{selectedLead.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a lead to start calling</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Calls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Calls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {initialData.recentCalls.map((call) => (
                <div key={call.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{call.leadName}</div>
                    <div className="flex items-center space-x-1">
                      {getOutcomeIcon(call.outcome)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{call.phone}</div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{formatDuration(call.duration)}</span>
                    <span>{new Date(call.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
