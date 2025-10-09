import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  TrendingUp,
  Activity,
  Calendar,
  DollarSign,
  Target,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Bell,
  Settings
} from "lucide-react";

interface InstitutionStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  upcomingAppointments: number;
  pendingTasks: number;
}

interface InstitutionDashboardProps {
  stats: InstitutionStats;
  tenantSlug: string;
}

export function InstitutionDashboard({ stats, tenantSlug }: InstitutionDashboardProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: `${stats.activeUsers} active users`,
      icon: Users,
      trend: stats.newUsersThisMonth,
      trendLabel: "this month",
      trendType: "positive" as const,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Total Leads",
      value: stats.totalLeads,
      description: `${stats.convertedLeads} converted`,
      icon: Target,
      trend: stats.conversionRate,
      trendLabel: "conversion rate",
      trendType: stats.conversionRate > 20 ? "positive" : "neutral" as const,
      color: "bg-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      description: "Current month",
      icon: DollarSign,
      trend: stats.revenueGrowth,
      trendLabel: "vs last month",
      trendType: stats.revenueGrowth > 0 ? "positive" : "neutral" as const,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Appointments",
      value: stats.upcomingAppointments,
      description: "Next 7 days",
      icon: Calendar,
      trend: stats.pendingTasks,
      trendLabel: "pending tasks",
      trendType: stats.pendingTasks > 0 ? "warning" : "positive" as const,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  const recentActivities = [
    {
      id: "1",
      type: "user_created",
      message: "Sarah Johnson joined as Telecaller",
      time: "2 hours ago",
      icon: UserPlus,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "2",
      type: "lead_converted",
      message: "Lead #1234 converted to application",
      time: "4 hours ago",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "3",
      type: "revenue_milestone",
      message: "Monthly revenue target achieved",
      time: "1 day ago",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "4",
      type: "system_update",
      message: "New features available in dashboard",
      time: "2 days ago",
      icon: Activity,
      color: "bg-gray-100 text-gray-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Institution Dashboard
              </h1>
              <Badge variant="secondary" className="text-xs px-3 py-1 bg-blue-100 text-blue-700 border-blue-200">
                {tenantSlug}
              </Badge>
            </div>
            <p className="text-gray-600">
              Welcome back! Here&apos;s what&apos;s happening with your institution today.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="hover:bg-gray-50">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${stat.lightColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {stat.description}
                    </span>
                    <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
                      stat.trendType === "positive" 
                        ? "bg-green-100 text-green-700" 
                        : stat.trendType === "warning"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {stat.trendType === "positive" && <ArrowUp className="h-3 w-3" />}
                      {stat.trendType === "warning" && <ArrowDown className="h-3 w-3" />}
                      <span>
                        {typeof stat.trend === 'number' && stat.trend > 0 ? '+' : ''}
                        {stat.trend}
                        {stat.trendType === "positive" && typeof stat.trend === 'number' ? '%' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Recent Activity */}
          <Card className="lg:col-span-2 border-0 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                    <CardDescription className="text-sm">Latest updates from your institution</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {recentActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`flex-shrink-0 p-2 rounded-lg ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Settings className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                  <CardDescription className="text-sm">Common tasks and shortcuts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <UserPlus className="h-4 w-4 mr-3" />
                Add New User
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Target className="h-4 w-4 mr-3" />
                View Leads
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-3" />
                Schedule Meeting
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="h-4 w-4 mr-3" />
                View Revenue Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Performance Overview */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Performance Overview</CardTitle>
                  <CardDescription className="text-sm">Key metrics and insights for your institution</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.conversionRate}%
                </div>
                <div className="text-sm font-medium text-gray-600">Conversion Rate</div>
                <div className="flex items-center justify-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUp className="h-3 w-3" />
                  <span>Above industry average</span>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.activeUsers}
                </div>
                <div className="text-sm font-medium text-gray-600">Active Team Members</div>
                <div className="flex items-center justify-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <Activity className="h-3 w-3" />
                  <span>{Math.round((stats.activeUsers / stats.totalUsers) * 100)}% engagement</span>
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ₹{stats.monthlyRevenue.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-gray-600">Monthly Revenue</div>
                <div className={`flex items-center justify-center space-x-1 text-xs px-2 py-1 rounded-full ${
                  stats.revenueGrowth > 0 
                    ? "text-green-600 bg-green-50" 
                    : "text-gray-600 bg-gray-50"
                }`}>
                  {stats.revenueGrowth > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  <span>
                    {stats.revenueGrowth > 0 ? `+${stats.revenueGrowth}% growth` : "No growth"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
