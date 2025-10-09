"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, Target, CheckCircle, TrendingUp } from "lucide-react";

interface LeadsStatsProps {
  stats: Record<string, number> | null;
  loading?: boolean;
}

export const LeadsStats = memo(function LeadsStats({ stats, loading }: LeadsStatsProps) {
  const statsConfig = [
    {
      key: "total",
      title: "Total Leads",
      icon: User,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
      badgeClass: "bg-blue-100 text-blue-800",
    },
    {
      key: "new",
      title: "New Leads",
      icon: Target,
      color: "bg-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-600",
      badgeClass: "bg-green-100 text-green-800",
    },
    {
      key: "contacted",
      title: "Contacted",
      icon: Phone,
      color: "bg-yellow-500",
      lightColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      badgeClass: "bg-yellow-100 text-yellow-800",
    },
    {
      key: "qualified",
      title: "Qualified",
      icon: CheckCircle,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
      badgeClass: "bg-purple-100 text-purple-800",
    },
    {
      key: "converted",
      title: "Converted",
      icon: TrendingUp,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      badgeClass: "bg-emerald-100 text-emerald-800",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {statsConfig.map((config) => (
        <Card key={config.key} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${config.lightColor}`}>
                <config.icon className={`h-6 w-6 ${config.textColor}`} />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-600">
                {config.title}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.[config.key] || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
