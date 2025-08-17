"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { mockBranchInfo, mockCrowdUpdates, type CrowdUpdate } from "@/lib/operator-data"
import { Users, Plus, Minus, RotateCcw, Clock, TrendingUp, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CrowdManagementPage() {
  const [currentCount, setCurrentCount] = useState(15)
  const [manualCount, setManualCount] = useState("")
  const [notes, setNotes] = useState("")
  const [updates, setUpdates] = useState<CrowdUpdate[]>(mockCrowdUpdates)
  const { toast } = useToast()

  const updateCrowd = (changeType: "increase" | "decrease" | "manual", newCount?: number) => {
    const previousCount = currentCount
    let updatedCount = currentCount

    if (changeType === "increase") {
      updatedCount = currentCount + 1
    } else if (changeType === "decrease") {
      updatedCount = Math.max(0, currentCount - 1)
    } else if (changeType === "manual" && newCount !== undefined) {
      updatedCount = Math.max(0, newCount)
    }

    const newUpdate: CrowdUpdate = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      previousCount,
      newCount: updatedCount,
      changeType,
      operatorId: "2",
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
  }

  const handleManualUpdate = () => {
    const count = Number.parseInt(manualCount)
    if (!isNaN(count) && count >= 0) {
      updateCrowd("manual", count)
    }
  }

  const getCrowdLevel = (count: number) => {
    if (count <= 10) return { level: "Low", color: "bg-green-500", variant: "default" as const }
    if (count <= 25) return { level: "Medium", color: "bg-yellow-500", variant: "secondary" as const }
    return { level: "High", color: "bg-red-500", variant: "destructive" as const }
  }

  const crowdInfo = getCrowdLevel(currentCount)
  const capacityPercentage = (currentCount / mockBranchInfo.capacity) * 100

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crowd Management</h1>
          <p className="text-muted-foreground mt-2">Update real-time crowd data for {mockBranchInfo.name}</p>
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
                  {capacityPercentage.toFixed(1)}% of capacity ({mockBranchInfo.capacity} max)
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
                <Button onClick={() => updateCrowd("increase")} className="flex-1" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  +1
                </Button>
                <Button
                  onClick={() => updateCrowd("decrease")}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                  disabled={currentCount === 0}
                >
                  <Minus className="h-4 w-4 mr-1" />
                  -1
                </Button>
              </div>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Set count"
                  value={manualCount}
                  onChange={(e) => setManualCount(e.target.value)}
                  min="0"
                  className="flex-1"
                />
                <Button onClick={handleManualUpdate} variant="outline" size="sm" disabled={!manualCount}>
                  Set
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branch Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Staff on duty:</span>
                <span className="font-medium">{mockBranchInfo.currentStaff}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service hours:</span>
                <span className="font-medium">{mockBranchInfo.serviceHours}</span>
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
