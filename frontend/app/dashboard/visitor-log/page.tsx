"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { useBranches } from "@/hooks/use-branches"
import { useVisitorLogs, useCreateVisitorLog } from "@/hooks/use-visitor-logs"
import { VisitorLog } from "@/lib/api"
import { Users, Plus, Clock, UserCheck, Calendar, Building2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface ExtendedVisitorLog extends VisitorLog {
  status: "waiting" | "in-service" | "completed"
  waitTime: number
}

export default function VisitorLogPage() {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")
  const [logDialogOpen, setLogDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    visitorName: "",
    checkInDate: undefined as Date | undefined,
    checkInTime: "",
    serviceStartDate: undefined as Date | undefined,
    serviceStartTime: "",
  })
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch branches and all visitor logs
  const { branches, loading: branchesLoading } = useBranches()
  const { visitorLogs, loading: logsLoading, refetch: refetchLogs } = useVisitorLogs()
  const { createVisitorLog, loading: creatingLog } = useCreateVisitorLog()

  // Filter visitor logs by selected branch (only if a branch is actually selected)
  const filteredLogs = selectedBranchId && selectedBranchId !== "" 
    ? visitorLogs.filter(log => log.branchId === selectedBranchId)
    : visitorLogs

  // Process visitor logs for display
  const processedLogs: ExtendedVisitorLog[] = filteredLogs.map((log) => {
    const checkIn = new Date(log.checkInTime)
    const serviceStart = log.serviceStartTime ? new Date(log.serviceStartTime) : null
    const waitTime = serviceStart ? Math.round((serviceStart.getTime() - checkIn.getTime()) / (1000 * 60)) : 0

    let status: "waiting" | "in-service" | "completed" = "waiting"
    if (serviceStart) {
      // If service started more than 30 minutes ago, consider it completed
      const now = new Date()
      const serviceMinutes = (now.getTime() - serviceStart.getTime()) / (1000 * 60)
      status = serviceMinutes > 30 ? "completed" : "in-service"
    }

    return {
      ...log,
      status,
      waitTime,
    }
  })

  const handleLogVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedBranchId) {
      toast({
        title: "No branch selected",
        description: "Please select a branch first.",
        variant: "destructive",
      })
      return
    }

    if (!formData.checkInDate || !formData.checkInTime) {
      toast({
        title: "Missing check-in information",
        description: "Please select both check-in date and time.",
        variant: "destructive",
      })
      return
    }

    try {
      // Combine date and time for check-in
      const checkInDateTime = new Date(formData.checkInDate)
      const [checkInHours, checkInMinutes] = formData.checkInTime.split(':').map(Number)
      checkInDateTime.setHours(checkInHours, checkInMinutes, 0, 0)

      // Combine date and time for service start (if provided)
      let serviceStartDateTime: Date | undefined = undefined
      if (formData.serviceStartDate && formData.serviceStartTime) {
        serviceStartDateTime = new Date(formData.serviceStartDate)
        const [serviceHours, serviceMinutes] = formData.serviceStartTime.split(':').map(Number)
        serviceStartDateTime.setHours(serviceHours, serviceMinutes, 0, 0)
      }

      // Calculate wait time if service start time is provided
      let waitTimeInMinutes: number | undefined = undefined
      if (serviceStartDateTime) {
        waitTimeInMinutes = Math.round(
          (serviceStartDateTime.getTime() - checkInDateTime.getTime()) / (1000 * 60)
        )
      }

      const logData = {
        visitorName: formData.visitorName,
        branchId: selectedBranchId,
        checkInTime: checkInDateTime.toISOString(),
        serviceStartTime: serviceStartDateTime?.toISOString(),
        waitTimeInMinutes,
      }

      const result = await createVisitorLog(logData)

      if (result) {
        // Reset form
        setFormData({
          visitorName: "",
          checkInDate: undefined,
          checkInTime: "",
          serviceStartDate: undefined,
          serviceStartTime: "",
        })
        setLogDialogOpen(false)

        // Refetch logs to get the latest data
        refetchLogs()

        toast({
          title: "Visit logged successfully",
          description: `${formData.visitorName}'s visit has been recorded`,
        })
      }
    } catch (error) {
      console.error("Error logging visit:", error)
      toast({
        title: "Error",
        description: "Failed to log visit. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="secondary">Waiting</Badge>
      case "in-service":
        return <Badge variant="default">In Service</Badge>
      case "completed":
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "Not set"
    return new Date(timeString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timeString: string) => {
    return new Date(timeString).toLocaleDateString()
  }

  const todayLogs = processedLogs.filter(
    (log) => new Date(log.checkInTime).toDateString() === new Date().toDateString()
  )

  const selectedBranch = branches.find(b => b.branchId === selectedBranchId)

  if (branchesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading branches...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (branches.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Branches Available</h3>
          <p className="text-muted-foreground">No branches are available for visitor logging.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Visitor Log</h1>
            <p className="text-muted-foreground mt-2">
              Track visitor check-ins and service times {selectedBranch ? `for ${selectedBranch.name}` : "across all branches"}
            </p>
          </div>
          <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Log Visit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Log New Visit</DialogTitle>
                <DialogDescription>Record a visitor's check-in and service information.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleLogVisit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visitor-name">Visitor Name</Label>
                  <Input
                    id="visitor-name"
                    placeholder="Enter visitor's full name"
                    value={formData.visitorName}
                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch-name">Branch</Label>
                  <Select
                    value={selectedBranchId}
                    onValueChange={setSelectedBranchId}
                    disabled={branchesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={branchesLoading ? "Loading..." : "Select branch"} />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.branchId} value={branch.branchId}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check-in-date">Check In Date</Label>
                  <DatePicker
                    date={formData.checkInDate}
                    onDateChange={(date) => setFormData({ ...formData, checkInDate: date })}
                    placeholder="Select check-in date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check-in-time">Check In Time</Label>
                  <Input
                    id="check-in-time"
                    type="time"
                    value={formData.checkInTime}
                    onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Enter time in HH:MM format (24-hour)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-start-date">Service Start Date (Optional)</Label>
                  <DatePicker
                    date={formData.serviceStartDate}
                    onDateChange={(date) => setFormData({ ...formData, serviceStartDate: date })}
                    placeholder="Select service start date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-start-time">Service Start Time (Optional)</Label>
                  <Input
                    id="service-start-time"
                    type="time"
                    value={formData.serviceStartTime}
                    onChange={(e) => setFormData({ ...formData, serviceStartTime: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Enter time in HH:MM format (24-hour). Leave empty if visitor is still waiting.</p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLogDialogOpen(false)}
                    className="cursor-pointer bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatingLog || !formData.checkInDate || !formData.checkInTime} className="cursor-pointer">
                    {creatingLog ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Logging...
                      </>
                    ) : (
                      "Log Visit"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{todayLogs.length}</div>
                  <div className="text-sm text-muted-foreground">Total Visits Today</div>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-accent">
                    {todayLogs.filter((log) => log.status === "waiting").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Currently Waiting</div>
                </div>
                <Clock className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {todayLogs.filter((log) => log.status === "in-service").length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Service</div>
                </div>
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-accent">
                    {todayLogs.length > 0
                      ? Math.round(todayLogs.reduce((sum, log) => sum + log.waitTime, 0) / todayLogs.length)
                      : 0}
                    m
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Wait Time</div>
                </div>
                <Clock className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Visitor Logs
            </CardTitle>
            <CardDescription>
              Recent visitor check-ins and service records {selectedBranch ? `for ${selectedBranch.name}` : "across all branches"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading visitor logs...</span>
              </div>
            ) : processedLogs.length > 0 ? (
              <div className="space-y-4">
                {processedLogs.map((log) => {
                  const logBranch = branches.find(b => b.branchId === log.branchId)
                  return (
                    <div key={log.visitorLogId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {log.visitorName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{log.visitorName}</h3>
                            {getStatusBadge(log.status)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground space-x-4">
                            <span className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1" />
                              {logBranch?.name || "Unknown Branch"}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(log.checkInTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-muted-foreground">Check-in: </span>
                            <span className="font-medium">{formatTime(log.checkInTime)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Service: </span>
                            <span className="font-medium">{formatTime(log.serviceStartTime || "")}</span>
                          </div>
                          {log.waitTime > 0 && (
                            <div>
                              <span className="text-muted-foreground">Wait: </span>
                              <span className="font-medium text-accent">{log.waitTime}m</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No visitor logs yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start logging visitor check-ins to track branch activity.
                </p>
                <Button onClick={() => setLogDialogOpen(true)} className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Log First Visit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
