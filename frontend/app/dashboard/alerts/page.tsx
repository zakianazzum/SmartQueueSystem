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
import { mockAlerts, mockInstitutions } from "@/lib/mock-data"
import { Bell, BellOff, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [createAlertDialogOpen, setCreateAlertDialogOpen] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState("")
  const [selectedThreshold, setSelectedThreshold] = useState<number | "">("")
  const { toast } = useToast()

  const toggleAlert = (alertId: string) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert)))
  }

  const removeAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId))
  }

  const createAlert = () => {
    if (selectedInstitution && selectedThreshold !== "") {
      const institution = mockInstitutions.find((inst) => inst.id === selectedInstitution)
      if (institution) {
        const newAlert = {
          id: Date.now().toString(),
          institutionId: selectedInstitution,
          institutionName: institution.name,
          threshold: selectedThreshold as number,
          isActive: true,
          createdAt: new Date().toISOString().split("T")[0],
        }
        setAlerts([...alerts, newAlert])
        setSelectedInstitution("")
        setSelectedThreshold("")
        setCreateAlertDialogOpen(false)
        toast({
          title: "Alert Created",
          description: `You'll be notified when ${institution.name} has ${selectedThreshold} people or fewer.`,
        })
      }
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
              <Button className="cursor-pointer">
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
                  <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockInstitutions.map((institution) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.name}
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
                    disabled={!selectedInstitution || selectedThreshold === ""}
                    className="cursor-pointer"
                  >
                    Create Alert
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Alerts</h2>
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${alert.isActive ? "bg-primary/10" : "bg-muted"}`}>
                        {alert.isActive ? (
                          <Bell className={`h-5 w-5 ${alert.isActive ? "text-primary" : "text-muted-foreground"}`} />
                        ) : (
                          <BellOff className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{alert.institutionName}</h3>
                          <Badge variant={alert.isActive ? "default" : "secondary"}>
                            {alert.isActive ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Notify when crowd count is <strong>{alert.threshold}</strong> people or fewer
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created on {new Date(alert.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Active</span>
                        <Switch checked={alert.isActive} onCheckedChange={() => toggleAlert(alert.id)} />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive cursor-pointer"
                        onClick={() => removeAlert(alert.id)}
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
                  <Button className="cursor-pointer">
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
                      <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an institution" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockInstitutions.map((institution) => (
                            <SelectItem key={institution.id} value={institution.id}>
                              {institution.name}
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
                        disabled={!selectedInstitution || selectedThreshold === ""}
                        className="cursor-pointer"
                      >
                        Create Alert
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Alert Statistics */}
        {alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Alert Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{alerts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Alerts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {alerts.filter((alert) => alert.isActive).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Alerts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {alerts.length > 0
                      ? Math.round(alerts.reduce((sum, alert) => sum + (alert.threshold as number), 0) / alerts.length)
                      : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Threshold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {alerts.length > 0 ? Math.min(...alerts.map((alert) => alert.threshold as number)) : 0}
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
