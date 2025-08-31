"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Bell, BellOff, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useInstitutions } from "@/hooks/use-institutions"
import { useBranches } from "@/hooks/use-branches"
import { useAlertPreferences, useCreateAlertPreference, useDeleteAlertPreference } from "@/hooks/use-alert-preferences"
import { AlertPreference } from "@/lib/api"

export default function AlertsPage() {
  const [createAlertDialogOpen, setCreateAlertDialogOpen] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedThreshold, setSelectedThreshold] = useState<number | "">("")
  const { toast } = useToast()
  const { user } = useAuth()
  
  // Fetch real data
  const { institutions, loading: institutionsLoading } = useInstitutions()
  const { branches, loading: branchesLoading } = useBranches()
  const { alertPreferences, loading: alertsLoading, refetch: refetchAlerts } = useAlertPreferences(user?.visitorId)
  const { createAlertPreference, loading: creatingAlert } = useCreateAlertPreference()
  const { deleteAlertPreference, loading: deletingAlert } = useDeleteAlertPreference()

  // Filter branches based on selected institution
  const filteredBranches = branches.filter(
    (branch) => !selectedInstitution || branch.institutionId === selectedInstitution
  )

  const removeAlert = async (alertId: string) => {
    const success = await deleteAlertPreference(alertId)
    if (success) {
      refetchAlerts()
      toast({
        title: "Alert Removed",
        description: "Alert preference has been deleted successfully.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to remove alert preference.",
        variant: "destructive",
      })
    }
  }

  const createAlert = async () => {
    if (!selectedBranch || selectedThreshold === "" || !user?.visitorId) {
      toast({
        title: "Missing information",
        description: "Please select branch, threshold, and ensure you're logged in.",
        variant: "destructive",
      })
      return
    }

    const result = await createAlertPreference({
      visitorId: user.visitorId,
      branchId: selectedBranch,
      crowdThreshold: selectedThreshold as number,
    })

    if (result) {
      refetchAlerts()
      setSelectedInstitution("")
      setSelectedBranch("")
      setSelectedThreshold("")
      setCreateAlertDialogOpen(false)
      
      const branch = branches.find(b => b.branchId === selectedBranch)
      toast({
        title: "Alert Created",
        description: `You'll be notified when ${branch?.name || 'this branch'} has ${selectedThreshold} people or fewer.`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to create alert preference.",
        variant: "destructive",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Alert Preferences</h1>
            <p className="text-muted-foreground mt-2">
              Get notified when crowd levels drop below your preferred threshold
            </p>
          </div>
          <Dialog open={createAlertDialogOpen} onOpenChange={setCreateAlertDialogOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer" disabled={!user?.visitorId}>
                <Plus className="h-4 w-4 mr-2" />
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
                <DialogDescription>
                  Set up notifications for when crowd levels drop below your threshold.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Select 
                    value={selectedInstitution} 
                    onValueChange={(value) => {
                      setSelectedInstitution(value)
                      setSelectedBranch("") // Reset branch selection
                    }}
                    disabled={institutionsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={institutionsLoading ? "Loading..." : "Select an institution"} />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((institution) => (
                        <SelectItem key={institution.institutionId} value={institution.institutionId}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select 
                    value={selectedBranch} 
                    onValueChange={setSelectedBranch}
                    disabled={!selectedInstitution || branchesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedInstitution ? "Select institution first" : branchesLoading ? "Loading..." : "Select a branch"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredBranches.map((branch) => (
                        <SelectItem key={branch.branchId} value={branch.branchId}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Notify when crowd count is below</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Enter number of people"
                    value={selectedThreshold}
                    onChange={(e) => setSelectedThreshold(e.target.value ? Number.parseInt(e.target.value) : "")}
                    className="cursor-pointer"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateAlertDialogOpen(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createAlert}
                    disabled={!selectedBranch || selectedThreshold === "" || creatingAlert}
                    className="cursor-pointer"
                  >
                    {creatingAlert ? "Creating..." : "Create Alert"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Alerts */}
        {!user?.visitorId ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Please log in</h3>
              <p className="text-muted-foreground mb-6">
                You need to be logged in as a visitor to manage alert preferences
              </p>
            </CardContent>
          </Card>
        ) : alertsLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading alerts...</p>
            </CardContent>
          </Card>
        ) : alertPreferences.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Alerts</h2>
            {alertPreferences.map((alert) => (
              <Card key={alert.alertId}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{alert.branch?.name || 'Unknown Branch'}</h3>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Notify when crowd count is <strong>{alert.crowdThreshold}</strong> people or fewer
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created on {new Date(alert.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive cursor-pointer"
                        onClick={() => removeAlert(alert.alertId)}
                        disabled={deletingAlert}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No alerts set up</h3>
              <p className="text-muted-foreground mb-6">
                Create alerts to get notified when crowd levels drop at your favorite institutions
              </p>
              <Dialog open={createAlertDialogOpen} onOpenChange={setCreateAlertDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="cursor-pointer" disabled={!user?.visitorId}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Alert
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Alert</DialogTitle>
                    <DialogDescription>
                      Set up notifications for when crowd levels drop below your threshold.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="institution">Institution</Label>
                      <Select 
                        value={selectedInstitution} 
                        onValueChange={(value) => {
                          setSelectedInstitution(value)
                          setSelectedBranch("") // Reset branch selection
                        }}
                        disabled={institutionsLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={institutionsLoading ? "Loading..." : "Select an institution"} />
                        </SelectTrigger>
                        <SelectContent>
                          {institutions.map((institution) => (
                            <SelectItem key={institution.institutionId} value={institution.institutionId}>
                              {institution.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch</Label>
                      <Select 
                        value={selectedBranch} 
                        onValueChange={setSelectedBranch}
                        disabled={!selectedInstitution || branchesLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={!selectedInstitution ? "Select institution first" : branchesLoading ? "Loading..." : "Select a branch"} />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredBranches.map((branch) => (
                            <SelectItem key={branch.branchId} value={branch.branchId}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="threshold">Notify when crowd count is below</Label>
                      <Input
                        id="threshold"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Enter number of people"
                        value={selectedThreshold}
                        onChange={(e) => setSelectedThreshold(e.target.value ? Number.parseInt(e.target.value) : "")}
                        className="cursor-pointer"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateAlertDialogOpen(false)}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={createAlert}
                        disabled={!selectedBranch || selectedThreshold === "" || creatingAlert}
                        className="cursor-pointer"
                      >
                        {creatingAlert ? "Creating..." : "Create Alert"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Alert Statistics */}
        {user?.visitorId && alertPreferences.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Alert Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{alertPreferences.length}</div>
                  <div className="text-sm text-muted-foreground">Total Alerts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {alertPreferences.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Alerts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {alertPreferences.length > 0
                      ? Math.round(alertPreferences.reduce((sum, alert) => sum + alert.crowdThreshold, 0) / alertPreferences.length)
                      : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Threshold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {alertPreferences.length > 0 ? Math.min(...alertPreferences.map((alert) => alert.crowdThreshold)) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Lowest Threshold</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
