"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw, Clock } from "lucide-react";

interface ConnectionStatusProps {
    isConnected: boolean;
    isPolling: boolean;
    connectionError: string | null;
    onReconnect: () => void;
}

export function ConnectionStatus({
    isConnected,
    isPolling,
    connectionError,
    onReconnect,
}: ConnectionStatusProps) {
    if (isConnected) {
        return (
            <Alert className="border-green-200 bg-green-50">
                <Wifi className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                    <div className="flex items-center justify-between">
                        <span>Real-time notifications connected</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Live
                        </Badge>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    if (isPolling) {
        return (
            <Alert className="border-yellow-200 bg-yellow-50">
                <Clock className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                    <div className="flex items-center justify-between">
                        <span>Using polling for updates (every 30s)</span>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Polling
                        </Badge>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    if (connectionError) {
        return (
            <Alert className="border-red-200 bg-red-50">
                <WifiOff className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="font-medium">Connection Error</p>
                            <p className="text-sm text-red-600">{connectionError}</p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onReconnect}
                            className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    return null;
}
