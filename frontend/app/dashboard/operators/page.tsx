"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddOperatorModal } from "@/components/add-operator-modal"
import { EditOperatorModal } from "@/components/edit-operator-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { mockAdminOperators } from "@/lib/admin-data"
import { Users, Plus, Edit, Trash2, UserCheck, UserX, Clock, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OperatorsPage() {
  const [operators, setOperators] = useState(mockAdminOperators)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPerformance, setFilterPerformance] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedOperator, setSelectedOperator] = useState<any>(null)
  const { toast } = useToast()

  const filteredOperators = operators.filter((operator) => {
    const matchesSearch =
      operator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      operator.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || (filterStatus === "active" ? operator.isActive : !operator.isActive)
    const matchesPerformance =
      filterPerformance === "all" || operator.performance.toLowerCase() === filterPerformance.toLowerCase()

    return matchesSearch && matchesStatus && matchesPerformance
  })

  const getPerformanceBadgeVariant = (performance: string) => {
    switch (performance) {
      case "Excellent":
        return "default"
      case "Good":
        return "secondary"
      case "Average":
        return "outline"
      case "Needs Improvement":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "Excellent":
        return "text-green-600"
      case "Good":
        return "text-blue-600"
      case "Average":
        return "text-yellow-600"
      case "Needs Improvement":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const toggleOperatorStatus = (operatorId: string) => {
    setOperators(operators.map((op) => (op.id === operatorId ? { ...op, isActive: !op.isActive } : op)))
    const operator = operators.find((op) => op.id === operatorId)
    toast({
      title: operator?.isActive ? "Operator Deactivated" : "Operator Activated",
      description: `${operator?.name} has been ${operator?.isActive ? "deactivated" : "activated"}.`,
    })
  }

  const handleAddOperator = (operatorData: any) => {
    const newOperator = {
      id: `op${operators.length + 1}`,
      ...operatorData,
      isActive: true,
      performance: "Good",
      totalUpdates: 0,
      averageResponseTime: 5,
      lastActive: new Date().toISOString(),
      branchName: "Downtown Branch", // Mock assignment
      institutionName: "First National Bank", // Mock assignment
    }
    setOperators([...operators, newOperator])
    toast({
      title: "Operator Added",
      description: `${operatorData.name} has been successfully added as an operator.`,
    })
  }

  const handleEditOperator = (updatedOperator: any) => {
    setOperators(operators.map((op) => (op.id === updatedOperator.id ? updatedOperator : op)))
    toast({
      title: "Operator Updated",
      description: `${updatedOperator.name}'s information has been updated.`,
    })
  }

  const handleDeleteOperator = () => {
    if (selectedOperator) {
      setOperators(operators.filter((op) => op.id !== selectedOperator.id))
      toast({
        title: "Operator Removed",
        description: `${selectedOperator.name} has been removed from the system.`,
        variant: "destructive",
      })
    }
  }

  const openEditModal = (operator: any) => {
    setSelectedOperator(operator)
    setShowEditModal(true)
  }

  const openDeleteModal = (operator: any) => {
    setSelectedOperator(operator)
    setShowDeleteModal(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Operator Management</h1>
            <p className="text-muted-foreground mt-2">Manage operators, assignments, and monitor performance</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Operator
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{operators.length}</div>
              <div className="text-sm text-muted-foreground">Total Operators</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-accent">{operators.filter((op) => op.isActive).length}</div>
              <div className="text-sm text-muted-foreground">Active Operators</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{operators.filter((op) => op.branchId).length}</div>
              <div className="text-sm text-muted-foreground">Assigned to Branches</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-accent">
                {operators.filter((op) => op.performance === "Excellent").length}
              </div>
              <div className="text-sm text-muted-foreground">Excellent Performance</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search operators by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPerformance} onValueChange={setFilterPerformance}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by performance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Performance</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="needs improvement">Needs Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Operators List */}
        <div className="space-y-4">
          {filteredOperators.map((operator) => (
            <Card key={operator.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {operator.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-lg">{operator.name}</h3>
                        <Badge variant={operator.isActive ? "default" : "secondary"}>
                          {operator.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant={getPerformanceBadgeVariant(operator.performance)}>{operator.performance}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground space-x-4">
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {operator.email}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Last active: {new Date(operator.lastActive).toLocaleString()}
                        </span>
                      </div>
                      {operator.branchName ? (
                        <div className="text-sm mt-1">
                          <span className="text-muted-foreground">Assigned to: </span>
                          <span className="font-medium">{operator.branchName}</span>
                          {operator.institutionName && (
                            <span className="text-muted-foreground"> ({operator.institutionName})</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-destructive mt-1">Not assigned to any branch</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{operator.totalUpdates} updates</div>
                      <div className="text-xs text-muted-foreground">
                        {operator.averageResponseTime}min avg response
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleOperatorStatus(operator.id)}
                        className={`cursor-pointer ${
                          operator.isActive
                            ? "text-destructive hover:text-destructive"
                            : "text-green-600 hover:text-green-600"
                        }`}
                      >
                        {operator.isActive ? (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer bg-transparent"
                        onClick={() => openEditModal(operator)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive bg-transparent cursor-pointer"
                        onClick={() => openDeleteModal(operator)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{operator.totalUpdates}</div>
                      <div className="text-xs text-muted-foreground">Total Updates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-accent">{operator.averageResponseTime}m</div>
                      <div className="text-xs text-muted-foreground">Avg Response</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getPerformanceColor(operator.performance)}`}>
                        {operator.performance === "Excellent"
                          ? "A+"
                          : operator.performance === "Good"
                            ? "B+"
                            : operator.performance === "Average"
                              ? "C"
                              : "D"}
                      </div>
                      <div className="text-xs text-muted-foreground">Performance Grade</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{operator.isActive ? "Online" : "Offline"}</div>
                      <div className="text-xs text-muted-foreground">Current Status</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOperators.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No operators found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or filters to find operators.
              </p>
              <Button onClick={() => setShowAddModal(true)} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add New Operator
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <AddOperatorModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onConfirm={handleAddOperator} />

      <EditOperatorModal
        operator={selectedOperator}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleEditOperator}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteOperator}
        title="Remove Operator"
        description="Are you sure you want to remove this operator? This will revoke their access and remove all associated data."
        itemName={selectedOperator?.name || ""}
      />
    </DashboardLayout>
  )
}
