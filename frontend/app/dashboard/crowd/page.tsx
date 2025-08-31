"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { crowdDataApi, branchApi, type Branch } from "@/lib/api"
import { Users, Plus, Minus, RotateCcw, Clock, TrendingUp, AlertTriangle, Edit, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface CrowdUpdate {
  id: string
  timestamp: string
  previousCount: number
  newCount: number
  changeType: "increase" | "decrease" | "manual"
  operatorId: string
  notes?: string
}

export default function CrowdManagementPage() {
  const [currentCount, setCurrentCount] = useState(0)
  const [branch, setBranch] = useState<Branch | null>(null)
  const [manualCount, setManualCount] = useState("")
  const [notes, setNotes] = useState("")
  const [updates, setUpdates] = useState<CrowdUpdate[]>([])
  const [manualUpdateDialogOpen, setManualUpdateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    loadBranchData()
  }, [])

  const loadBranchData = async () => {
    try {
      setPageLoading(true)
      // For demo purposes, we'll use the first branch available
      // In a real app, this would be based on the operator's assigned branch
      const branches = await branchApi.getAll()
      if (branches.length > 0) {
        const currentBranch = branches[0]
        setBranch(currentBranch)

        // Get latest crowd data for this branch
        try {
          const latestCrowdData = await crowdDataApi.getLatestByBranch(currentBranch.id)
          setCurrentCount(latestCrowdData?.currentCrowdCount || 0)
        } catch (error) {
          console.log("No crowd data found, starting with 0")
          setCurrentCount(0)
        }

        // Load recent crowd data updates
        const recentData = await crowdDataApi.getByBranch(currentBranch.id)
        const mockUpdates = recentData.slice(0, 10).map((data, index) => ({
          id: data.id.toString(),
          timestamp: data.timestamp,
          previousCount:
            index < recentData.length - 1 ? recentData[index + 1].currentCrowdCount : data.currentCrowdCount - 1,
          newCount: data.currentCrowdCount,
          changeType: "manual" as const,
          operatorId: user?.id.toString() || "1",
        }))
        setUpdates(mockUpdates)
      }
    } catch (error) {
      console.error("Error loading branch data:", error)
      toast({
        title: "Error",
        description: "Failed to load branch data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPageLoading(false)
    }
  }

  const updateCrowd = async (changeType: "increase" | "decrease" | "manual", newCount?: number) => {
    if (!branch) return

    const previousCount = currentCount
    let updatedCount = currentCount

    if (changeType === "increase") {
      updatedCount = currentCount + 1
    } else if (changeType === "decrease") {
      updatedCount = Math.max(0, currentCount - 1)
    } else if (changeType === "manual" && newCount !== undefined) {
      updatedCount = Math.max(0, newCount)
    }

    try {
      const crowdDataEntry = await crowdDataApi.create({
        branchId: branch.id,
        timestamp: new Date().toISOString(),
        currentCrowdCount: updatedCount,
      })

      const newUpdate: CrowdUpdate = {
        id: crowdDataEntry.id.toString(),
        timestamp: crowdDataEntry.timestamp,
        previousCount,
        newCount: updatedCount,
        changeType,
        operatorId: user?.id.toString() || "1",
        notes: notes.trim() || undefined,
      }

      setCurrentCount(updatedCount)
      setUpdates([newUpdate, ...updates])
      setNotes("")
      setManualCount("")

      toast({
        title: "Crowd count updated",
        description: `Updated from ${previousCount} to ${updatedCount} people`,
      })
    } catch (error) {
      console.error("Error updating crowd data:", error)
      toast({
        title: "Error",
        description: "Failed to update crowd count. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleManualUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const count = Number.parseInt(manualCount)
    if (!isNaN(count) && count >= 0) {
      setIsLoading(true)
      await updateCrowd("manual", count)
      setManualUpdateDialogOpen(false)
      setIsLoading(false)
    }
  }

  const getCrowdLevel = (count: number, capacity: number) => {
    const percentage = (count / capacity) * 100
    if (percentage >= 80) return { level: "High", color: "bg-red-500", variant: "destructive" as const }
    if (percentage >= 50) return { level: "Medium", color: "bg-yellow-500", variant: "secondary" as const }
    return { level: "Low", color: "bg-green-500", variant: "default" as const }
  }

  if (pageLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading branch data...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (!branch) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Branch Assigned</h3>
          <p className="text-muted-foreground">Please contact your administrator to assign you to a branch.</p>
        </div>
      </DashboardLayout>
    )
  }

  const crowdInfo = getCrowdLevel(currentCount, branch.capacity)
  const capacityPercentage = (currentCount / branch.capacity) * 100

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crowd Management</h1>
          <p className="text-muted-foreground mt-2">Update real-time crowd data for {branch.name}</p>
        </div>

        {/* Current Status */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Current Crowd
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{currentCount}</div>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${crowdInfo.color}`}></div>
                  <Badge variant={crowdInfo.variant}>{crowdInfo.level}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {capacityPercentage.toFixed(1)}% of capacity ({branch.capacity} max)
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${crowdInfo.color}`}
                    style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-2">
                <Button onClick={() => updateCrowd("increase")} className="flex-1 cursor-pointer" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  +1
                </Button>
                <Button
                  onClick={() => updateCrowd("decrease")}
                  variant="outline"
                  className="flex-1 cursor-pointer bg-transparent"
                  size="sm"
                  disabled={currentCount === 0}
                >
                  <Minus className="h-4 w-4 mr-1" />
                  -1
                </Button>
              </div>

              <Dialog open={manualUpdateDialogOpen} onOpenChange={setManualUpdateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full cursor-pointer bg-transparent">
                    <Edit className="h-4 w-4 mr-2" />
                    Set Manual Count
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Set Manual Count</DialogTitle>
                    <DialogDescription>Update the crowd count manually with optional notes.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleManualUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="manual-count">Crowd Count</Label>
                      <Input
                        id="manual-count"
                        type="number"
                        placeholder="Enter crowd count"
                        value={manualCount}
                        onChange={(e) => setManualCount(e.target.value)}
                        min="0"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="e.g., Lunch rush starting, Special event, System maintenance..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setManualUpdateDialogOpen(false)}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading || !manualCount} className="cursor-pointer">
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          "Update Count"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branch Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Branch:</span>
                <span className="font-medium">{branch.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service hours:</span>
                <span className="font-medium">{branch.serviceHours}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Address:</span>
                <span className="font-medium">{branch.address}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last update:</span>
                <span className="font-medium">Just now</span>
              </div>
              {capacityPercentage > 80 && (
                <div className="flex items-center space-x-2 text-sm text-destructive mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Near capacity</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Add Notes (Optional)</CardTitle>
            <CardDescription>Add context to your crowd updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Textarea
                placeholder="e.g., Lunch rush starting, Special event, System maintenance..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Updates
            </CardTitle>
            <CardDescription>Your latest crowd count changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {updates.slice(0, 10).map((update) => (
                <div key={update.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {update.changeType === "increase" ? (
                        <div className="p-1 bg-green-100 rounded-full">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        </div>
                      ) : update.changeType === "decrease" ? (
                        <div className="p-1 bg-red-100 rounded-full">
                          <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
                        </div>
                      ) : (
                        <div className="p-1 bg-blue-100 rounded-full">
                          <RotateCcw className="h-3 w-3 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {update.previousCount} → {update.newCount}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {update.changeType === "increase" ? "+1" : update.changeType === "decrease" ? "-1" : "manual"}
                        </Badge>
                      </div>
                      {update.notes && <p className="text-sm text-muted-foreground mt-1">{update.notes}</p>}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{new Date(update.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
