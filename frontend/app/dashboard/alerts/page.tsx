"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockAlerts, mockInstitutions } from "@/lib/mock-data"
import { Bell, BellOff, Plus, Trash2 } from "lucide-react"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState("")
  const [selectedThreshold, setSelectedThreshold] = useState("")

  const toggleAlert = (alertId: string) => {
    setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert)))
  }

  const removeAlert = (alertId: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId))
  }

  const createAlert = () => {
    if (selectedInstitution && selectedThreshold) {
      const institution = mockInstitutions.find((inst) => inst.id === selectedInstitution)
      if (institution) {
        const newAlert = {
          id: Date.now().toString(),
          institutionId: selectedInstitution,
          institutionName: institution.name,
          threshold: selectedThreshold as "Low" | "Medium",
          isActive: true,
          createdAt: new Date().toISOString().split("T")[0],
        }
        setAlerts([...alerts, newAlert])
        setSelectedInstitution("")
        setSelectedThreshold("")
        setShowCreateForm(false)
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
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Alert
          </Button>
        </div>

        {/* Create Alert Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Alert</CardTitle>
              <CardDescription>Set up notifications for when crowd levels drop below your threshold</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Institution</label>
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
                <div>
                  <label className="text-sm font-medium mb-2 block">Notify when crowd is</label>
                  <Select value={selectedThreshold} onValueChange={setSelectedThreshold}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low or below</SelectItem>
                      <SelectItem value="Medium">Medium or below</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={createAlert} disabled={!selectedInstitution || !selectedThreshold}>
                  Create Alert
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                          Notify when crowd level is <strong>{alert.threshold}</strong> or below
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
                        className="text-destructive hover:text-destructive"
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
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Alert
              </Button>
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
                    {alerts.filter((alert) => alert.threshold === "Low").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Low Threshold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {alerts.filter((alert) => alert.threshold === "Medium").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Medium Threshold</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
