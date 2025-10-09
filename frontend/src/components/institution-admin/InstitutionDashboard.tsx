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
  CheckCircle
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
      description: `${stats.activeUsers} active`,
      icon: Users,
      trend: stats.newUsersThisMonth > 0 ? `+${stats.newUsersThisMonth} this month` : "No new users",
      trendType: "positive" as const,
    },
    {
      title: "Total Leads",
      value: stats.totalLeads,
      description: `${stats.convertedLeads} converted`,
      icon: Target,
      trend: `${stats.conversionRate}% conversion rate`,
      trendType: stats.conversionRate > 20 ? "positive" : "neutral" as const,
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      description: "This month",
      icon: DollarSign,
      trend: stats.revenueGrowth > 0 ? `+${stats.revenueGrowth}% growth` : "No growth",
      trendType: stats.revenueGrowth > 0 ? "positive" : "neutral" as const,
    },
    {
      title: "Upcoming Appointments",
      value: stats.upcomingAppointments,
      description: "Next 7 days",
      icon: Calendar,
      trend: stats.pendingTasks > 0 ? `${stats.pendingTasks} pending tasks` : "All caught up",
      trendType: stats.pendingTasks > 0 ? "warning" : "positive" as const,
    },
  ];

  const recentActivities = [
    {
      id: "1",
      type: "user_created",
      message: "Sarah Johnson joined as Telecaller",
      time: "2 hours ago",
      icon: UserPlus,
    },
    {
      id: "2",
      type: "lead_converted",
      message: "Lead #1234 converted to application",
      time: "4 hours ago",
      icon: CheckCircle,
    },
    {
      id: "3",
      type: "revenue_milestone",
      message: "Monthly revenue target achieved",
      time: "1 day ago",
      icon: TrendingUp,
    },
    {
      id: "4",
      type: "system_update",
      message: "New features available in dashboard",
      time: "2 days ago",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-heading-text">
            Institution Dashboard
          </h1>
          <p className="text-subtext mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your institution.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="text-sm">
            {tenantSlug}
          </Badge>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-subtext">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-heading-text">
                {stat.value}
              </div>
              <p className="text-xs text-subtext mt-1">
                {stat.description}
              </p>
              <div className="flex items-center mt-2">
                <span
                  className={`text-xs ${stat.trendType === "positive"
                    ? "text-green-600"
                    : stat.trendType === "warning"
                      ? "text-yellow-600"
                      : "text-muted-foreground"
                    }`}
                >
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates from your institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <activity.icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-heading-text">
                      {activity.message}
                    </p>
                    <p className="text-xs text-subtext mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Target className="h-4 w-4 mr-2" />
              View Leads
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              View Revenue
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>
            Key metrics and insights for your institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-heading-text mb-2">
                {stats.conversionRate}%
              </div>
              <div className="text-sm text-subtext">Conversion Rate</div>
              <div className="text-xs text-green-600 mt-1">
                Above industry average
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-heading-text mb-2">
                {stats.activeUsers}
              </div>
              <div className="text-sm text-subtext">Active Team Members</div>
              <div className="text-xs text-blue-600 mt-1">
                {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% engagement
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-heading-text mb-2">
                ₹{stats.monthlyRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-subtext">Monthly Revenue</div>
              <div className="text-xs text-green-600 mt-1">
                {stats.revenueGrowth > 0 ? `+${stats.revenueGrowth}% growth` : "No growth"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
