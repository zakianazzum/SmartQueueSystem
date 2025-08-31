"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnalyticsFilterDialog } from "@/components/analytics-filter-dialog"
import { mockSystemStats, mockDailyAnalytics } from "@/lib/admin-data"
import { BarChart3, TrendingUp, Users, Building2, Activity, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [filteredAnalytics, setFilteredAnalytics] = useState(mockDailyAnalytics)

  const handleApplyFilters = (filteredData: any[]) => {
    setFilteredAnalytics(filteredData)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Analytics</h1>
            <p className="text-muted-foreground mt-2">Monitor system performance and usage statistics</p>
          </div>
          <div className="flex gap-2">
            <AnalyticsFilterDialog onApplyFilters={handleApplyFilters} />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{mockSystemStats.totalInstitutions}</div>
                  <div className="text-sm text-muted-foreground">Total Institutions</div>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-accent">{mockSystemStats.totalBranches}</div>
                  <div className="text-sm text-muted-foreground">Active Branches</div>
                </div>
                <Building2 className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{mockSystemStats.totalOperators}</div>
                  <div className="text-sm text-muted-foreground">Total Operators</div>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-accent">{mockSystemStats.totalVisitors.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Registered Visitors</div>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                System Health
              </CardTitle>
              <CardDescription>Current system status and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">System Uptime</span>
                </div>
                <Badge variant="default">{mockSystemStats.systemUptime}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm">Active Operators</span>
                </div>
                <Badge variant="secondary">
                  {mockSystemStats.activeOperators}/{mockSystemStats.totalOperators}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="text-sm">Total Updates Today</span>
                </div>
                <Badge variant="outline">{mockSystemStats.totalCrowdUpdates}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm">Avg Wait Time</span>
                </div>
                <Badge variant="secondary">{mockSystemStats.averageWaitTime}m</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                System Alerts
              </CardTitle>
              <CardDescription>Recent system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System maintenance completed</p>
                  <p className="text-xs text-muted-foreground">All services are running normally</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">High crowd alert at Passport Office</p>
                  <p className="text-xs text-muted-foreground">Crowd level reached 95% capacity</p>
                  <p className="text-xs text-muted-foreground">30 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New operator assigned</p>
                  <p className="text-xs text-muted-foreground">Lisa Chen assigned to DMV Center</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Daily Analytics
              {filteredAnalytics.length !== mockDailyAnalytics.length && (
                <Badge variant="outline" className="ml-2">
                  Filtered
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {filteredAnalytics.length === mockDailyAnalytics.length
                ? "System usage and activity over the past week"
                : `Filtered results: ${filteredAnalytics.length} entries`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAnalytics.length > 0 ? (
                filteredAnalytics.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium w-16">{day.date}</span>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span>{day.institutions} institutions</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-accent" />
                          <span>{day.operators} operators</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-4 w-4 text-primary" />
                          <span>{day.updates} updates</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-accent" />
                          <span>{day.visitors} visitors</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${(day.updates / 200) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data matches the current filter criteria
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Branches</CardTitle>
              <CardDescription>Branches with highest activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Central Bank Downtown</span>
                <Badge variant="default">156 updates</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">DMV Center</span>
                <Badge variant="secondary">134 updates</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Community Bank West</span>
                <Badge variant="outline">89 updates</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Peak Hours</CardTitle>
              <CardDescription>Busiest times across all branches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">12:00 PM - 2:00 PM</span>
                <Badge variant="destructive">High</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">3:00 PM - 4:00 PM</span>
                <Badge variant="secondary">Medium</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">9:00 AM - 10:00 AM</span>
                <Badge variant="default">Low</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Institution Types</CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Banks</span>
                <Badge variant="default">2 institutions</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Government</span>
                <Badge variant="secondary">1 institution</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Parks</span>
                <Badge variant="outline">0 institutions</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
