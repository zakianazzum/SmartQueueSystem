"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Building2, Users, Clock, TrendingUp, AlertTriangle, Heart, Bell } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const getWelcomeMessage = () => {
    switch (user.role) {
      case "visitor":
        return "Welcome to your SmartQueue dashboard! Check crowd levels and plan your visits efficiently."
      case "operator":
        return "Welcome to your operator dashboard! Manage crowd data for your assigned branch."
      case "admin":
        return "Welcome to your admin dashboard! Oversee institutions and manage the SmartQueue system."
      default:
        return "Welcome to SmartQueue!"
    }
  }

  const getStatsCards = () => {
    switch (user.role) {
      case "visitor":
        return [
          {
            title: "Favorite Institutions",
            value: "3",
            description: "Quick access locations",
            icon: Heart,
            color: "text-primary",
          },
          {
            title: "Active Alerts",
            value: "2",
            description: "Crowd level notifications",
            icon: AlertTriangle,
            color: "text-accent",
          },
          {
            title: "Avg. Wait Time Saved",
            value: "25 min",
            description: "This month",
            icon: Clock,
            color: "text-primary",
          },
          {
            title: "Institutions Visited",
            value: "12",
            description: "Total visits tracked",
            icon: Building2,
            color: "text-accent",
          },
        ]
      case "operator":
        return [
          {
            title: "Current Crowd Level",
            value: "Medium",
            description: "15 people in queue",
            icon: Users,
            color: "text-accent",
          },
          {
            title: "Today's Peak",
            value: "High",
            description: "32 people at 2:30 PM",
            icon: TrendingUp,
            color: "text-primary",
          },
          {
            title: "Avg. Service Time",
            value: "8 min",
            description: "Per customer today",
            icon: Clock,
            color: "text-accent",
          },
          {
            title: "Updates Made",
            value: "24",
            description: "Crowd updates today",
            icon: Building2,
            color: "text-primary",
          },
        ]
      case "admin":
        return [
          {
            title: "Total Institutions",
            value: "45",
            description: "Active locations",
            icon: Building2,
            color: "text-primary",
          },
          {
            title: "Active Operators",
            value: "38",
            description: "Currently online",
            icon: Users,
            color: "text-accent",
          },
          {
            title: "System Uptime",
            value: "99.8%",
            description: "Last 30 days",
            icon: TrendingUp,
            color: "text-primary",
          },
          {
            title: "Total Users",
            value: "2,847",
            description: "Registered visitors",
            icon: Users,
            color: "text-accent",
          },
        ]
      default:
        return []
    }
  }

  const statsCards = getStatsCards()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground mt-2">{getWelcomeMessage()}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card, index) => {
            const Icon = card.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                {user.role === "visitor" && "Frequently used features"}
                {user.role === "operator" && "Manage your branch efficiently"}
                {user.role === "admin" && "System management tools"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user.role === "visitor" && (
                  <>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm">Find nearby institutions</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <Clock className="h-4 w-4 text-accent" />
                      <span className="text-sm">Check wait times</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <Bell className="h-4 w-4 text-primary" />
                      <span className="text-sm">Set up alerts</span>
                    </div>
                  </>
                )}
                {user.role === "operator" && (
                  <>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm">Update crowd count</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <span className="text-sm">View analytics</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm">Update branch info</span>
                    </div>
                  </>
                )}
                {user.role === "admin" && (
                  <>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm">Manage institutions</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <Users className="h-4 w-4 text-accent" />
                      <span className="text-sm">Manage operators</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm">System analytics</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.role === "visitor" && (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">Central Bank crowd level dropped to Low</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">New wait time prediction available for City Park</p>
                        <p className="text-xs text-muted-foreground">15 minutes ago</p>
                      </div>
                    </div>
                  </>
                )}
                {user.role === "operator" && (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">Crowd count updated to 15 people</p>
                        <p className="text-xs text-muted-foreground">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">Peak hour alert: High crowd expected at 3 PM</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                  </>
                )}
                {user.role === "admin" && (
                  <>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">New operator assigned to Downtown Branch</p>
                        <p className="text-xs text-muted-foreground">30 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">System maintenance completed successfully</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
