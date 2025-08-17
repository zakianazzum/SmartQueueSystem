"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { mockBranchInfo, mockDailyStats, mockHourlyData } from "@/lib/operator-data"
import { Building2, MapPin, Clock, Users, Edit, Save, X, BarChart3, TrendingUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BranchInfoPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [branchData, setBranchData] = useState(mockBranchInfo)
  const [editData, setEditData] = useState(mockBranchInfo)
  const { toast } = useToast()

  const handleSave = () => {
    setBranchData(editData)
    setIsEditing(false)
    toast({
      title: "Branch information updated",
      description: "Your changes have been saved successfully",
    })
  }

  const handleCancel = () => {
    setEditData(branchData)
    setIsEditing(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Branch Information</h1>
            <p className="text-muted-foreground mt-2">Manage your branch details and view performance metrics</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Info
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Branch Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Branch Details
            </CardTitle>
            <CardDescription>Basic information about your assigned branch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Branch Name</label>
                {isEditing ? (
                  <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">{branchData.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Institution</label>
                {isEditing ? (
                  <Input
                    value={editData.institutionName}
                    onChange={(e) => setEditData({ ...editData, institutionName: e.target.value })}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded">{branchData.institutionName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Address</label>
              {isEditing ? (
                <Input
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                />
              ) : (
                <p className="text-sm p-2 bg-muted rounded flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {branchData.address}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Service Hours</label>
                {isEditing ? (
                  <Input
                    value={editData.serviceHours}
                    onChange={(e) => setEditData({ ...editData, serviceHours: e.target.value })}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {branchData.serviceHours}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Capacity</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editData.capacity}
                    onChange={(e) => setEditData({ ...editData, capacity: Number.parseInt(e.target.value) || 0 })}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {branchData.capacity} people
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Services Offered</label>
              {isEditing ? (
                <Textarea
                  value={editData.services.join(", ")}
                  onChange={(e) => setEditData({ ...editData, services: e.target.value.split(", ") })}
                  placeholder="Separate services with commas"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {branchData.services.map((service, index) => (
                    <Badge key={index} variant="outline">
                      {service}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Today's Performance
            </CardTitle>
            <CardDescription>Key metrics for your branch today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{mockDailyStats.totalUpdates}</div>
                <div className="text-sm text-muted-foreground">Updates Made</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{mockDailyStats.peakCount}</div>
                <div className="text-sm text-muted-foreground">Peak Crowd</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{mockDailyStats.averageCount}</div>
                <div className="text-sm text-muted-foreground">Avg Crowd</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{mockDailyStats.totalCustomersServed}</div>
                <div className="text-sm text-muted-foreground">Customers Served</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Hourly Breakdown
            </CardTitle>
            <CardDescription>Crowd levels and customers served throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockHourlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium w-16">{data.hour}</span>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{data.count} in queue</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${(data.count / 35) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-20">{data.served} served</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Staff Information */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Information</CardTitle>
            <CardDescription>Current staffing details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{branchData.currentStaff}</div>
                <div className="text-sm text-muted-foreground">Staff on Duty</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-accent">{mockDailyStats.averageServiceTime}m</div>
                <div className="text-sm text-muted-foreground">Avg Service Time</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{mockDailyStats.peakTime}</div>
                <div className="text-sm text-muted-foreground">Peak Time Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
