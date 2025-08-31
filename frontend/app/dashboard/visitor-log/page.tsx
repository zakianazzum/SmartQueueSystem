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
import { DateTimePicker } from "@/components/datetime-picker"
import { visitorLogApi, branchApi, type VisitorLog as ApiVisitorLog, type Branch } from "@/lib/api"
import { Users, Plus, Clock, UserCheck, Calendar, Building2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface ExtendedVisitorLog extends ApiVisitorLog {
  status: "waiting" | "in-service" | "completed"
  waitTime: number
}

export default function VisitorLogPage() {
  const [visitorLogs, setVisitorLogs] = useState<ExtendedVisitorLog[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [logDialogOpen, setLogDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [formData, setFormData] = useState({
    visitorName: "",
    branchId: "",
    checkInTime: undefined as Date | undefined,
    serviceStartTime: undefined as Date | undefined,
  })
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setPageLoading(true)

      // Load branches
      const branchesData = await branchApi.getAll()
      setBranches(branchesData)

      if (branchesData.length > 0) {
        setFormData((prev) => ({ ...prev, branchId: branchesData[0].id.toString() }))
      }

      // Load visitor logs (for demo, we'll get logs from the first branch)
      if (branchesData.length > 0) {
        const logs = await visitorLogApi.getByBranch(branchesData[0].id)

        const enhancedLogs: ExtendedVisitorLog[] = logs.map((log) => {
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

        setVisitorLogs(enhancedLogs)
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load visitor logs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPageLoading(false)
    }
  }

  const handleLogVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const logData = {
        visitorName: formData.visitorName,
        branchId: Number.parseInt(formData.branchId),
        checkInTime: formData.checkInTime!.toISOString(),
        serviceStartTime: formData.serviceStartTime?.toISOString(),
      }

      const newLog = await visitorLogApi.create(logData)

      // Reload data to get updated list
      await loadData()

      setFormData({
        visitorName: "",
        branchId: branches.length > 0 ? branches[0].id.toString() : "",
        checkInTime: undefined,
        serviceStartTime: undefined,
      })
      setLogDialogOpen(false)

      toast({
        title: "Visit logged successfully",
        description: `${formData.visitorName}'s visit has been recorded`,
      })
    } catch (error) {
      console.error("Error logging visit:", error)
      toast({
        title: "Error",
        description: "Failed to log visit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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

  const todayLogs = visitorLogs.filter((log) => new Date(log.checkInTime).toDateString() === new Date().toDateString())

  if (pageLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading visitor logs...</span>
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
            <p className="text-muted-foreground mt-2">Track visitor check-ins and service times for your branch</p>
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
                    value={formData.branchId}
                    onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check-in-time">Check In Time</Label>
                  <DateTimePicker
                    date={formData.checkInTime}
                    onDateChange={(date) => setFormData({ ...formData, checkInTime: date })}
                    placeholder="Select check-in date and time"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-start-time">Service Start Time (Optional)</Label>
                  <DateTimePicker
                    date={formData.serviceStartTime}
                    onDateChange={(date) => setFormData({ ...formData, serviceStartTime: date })}
                    placeholder="Select service start date and time"
                  />
                  <p className="text-xs text-muted-foreground">Leave empty if visitor is still waiting for service</p>
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
                  <Button type="submit" disabled={isLoading || !formData.checkInTime} className="cursor-pointer">
                    {isLoading ? (
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
            <CardDescription>Recent visitor check-ins and service records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {visitorLogs.length > 0 ? (
                visitorLogs.map((log) => {
                  const selectedBranch = branches.find((b) => b.id === log.branchId)
                  return (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                              {selectedBranch?.name || "Unknown Branch"}
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
                })
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
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
