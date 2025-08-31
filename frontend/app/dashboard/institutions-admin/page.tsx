"use client"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Institution, Branch } from "@/lib/api"
import { Building2, MapPin, Users, Clock, Plus, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import { AddInstitutionModal } from "@/components/add-institution-modal"
import { AddBranchModal } from "@/components/add-branch-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { useToast } from "@/hooks/use-toast"
import { useInstitutions, useCreateInstitution, useUpdateInstitution, useDeleteInstitution } from "@/hooks/use-institutions"
import { useBranches, useCreateBranch, useDeleteBranch } from "@/hooks/use-branches"
import { useCrowdData } from "@/hooks/use-crowd-data"

interface ExtendedInstitution extends Institution {
  branches: ExtendedBranch[]
}

interface ExtendedBranch extends Branch {
  currentCrowdLevel: string
  currentCrowdCount: number
  operatorName?: string
}

export default function InstitutionsAdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddBranchModal, setShowAddBranchModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState<ExtendedInstitution | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'institution' | 'branch', id: string, name: string } | null>(null)

  const { toast } = useToast()

  // Use custom hooks
  const { institutions, loading: institutionsLoading, refetch: refetchInstitutions } = useInstitutions()
  const { branches, loading: branchesLoading, refetch: refetchBranches } = useBranches()
  const { createInstitution, loading: creatingInstitution } = useCreateInstitution()
  const { updateInstitution, loading: updatingInstitution } = useUpdateInstitution()
  const { deleteInstitution, loading: deletingInstitution } = useDeleteInstitution()
  const { createBranch, loading: creatingBranch } = useCreateBranch()
  const { deleteBranch, loading: deletingBranch } = useDeleteBranch()

  // Process institutions with their branches
  const processedInstitutions: ExtendedInstitution[] = institutions.map(institution => {
    const institutionBranches = branches.filter(branch => branch.institutionId === institution.institutionId)
    
    const extendedBranches: ExtendedBranch[] = institutionBranches.map(branch => ({
      ...branch,
      currentCrowdLevel: "Low", // Default value - would be fetched from crowd data API
      currentCrowdCount: 0, // Default value - would be fetched from crowd data API
      operatorName: undefined, // Would be fetched from operator assignments
    }))

    return {
      ...institution,
      branches: extendedBranches,
    }
  })

  const getCrowdLevel = (currentCount: number, capacity: number): string => {
    if (!capacity || capacity === 0) return "Low"
    const percentage = (currentCount / capacity) * 100
    if (percentage >= 80) return "High"
    if (percentage >= 50) return "Medium"
    return "Low"
  }

  const filteredInstitutions = processedInstitutions.filter((institution) => {
    const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || 
      institution.institutionDescription?.toLowerCase().includes(filterType.toLowerCase())
    return matchesSearch && matchesType
  })

  const handleAddInstitution = async (newInstitution: Institution) => {
    await refetchInstitutions()
    toast({
      title: "Success",
      description: "Institution added successfully!",
    })
  }

  const handleAddBranch = async (institutionId: string, newBranch: Branch) => {
    await refetchBranches()
    await refetchInstitutions()
    toast({
      title: "Success",
      description: "Branch added successfully!",
    })
  }

  const handleDeleteInstitution = async () => {
    if (!deleteTarget || deleteTarget.type !== 'institution') return

    try {
      const success = await deleteInstitution(deleteTarget.id)
      if (success) {
        await refetchInstitutions()
        toast({
          title: "Success",
          description: "Institution deleted successfully!",
        })
        setShowDeleteModal(false)
        setDeleteTarget(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete institution. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBranch = async () => {
    if (!deleteTarget || deleteTarget.type !== 'branch') return

    try {
      const success = await deleteBranch(deleteTarget.id)
      if (success) {
        await refetchBranches()
        await refetchInstitutions()
        toast({
          title: "Success",
          description: "Branch deleted successfully!",
        })
        setShowDeleteModal(false)
        setDeleteTarget(null)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete branch. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getCrowdColor = (level: string) => {
    switch (level) {
      case "Low":
        return "bg-green-500"
      case "Medium":
        return "bg-yellow-500"
      case "High":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getCrowdBadgeVariant = (level: string) => {
    switch (level) {
      case "Low":
        return "default"
      case "Medium":
        return "secondary"
      case "High":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getAllBranches = () => {
    return processedInstitutions.flatMap((institution) =>
      institution.branches.map((branch) => ({
        ...branch,
        institutionName: institution.name,
        institutionType: institution.institutionDescription || "Unknown",
      })),
    )
  }

  const allBranches = getAllBranches()

  if (institutionsLoading || branchesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading institutions...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Institution Management</h1>
            <p className="text-muted-foreground mt-2">Manage institutions, branches, and their configurations</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Institution
          </Button>
        </div>

        <Tabs defaultValue="institutions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="institutions">Institutions</TabsTrigger>
            <TabsTrigger value="branches">All Branches</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="institutions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search institutions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="bank">Banks</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="park">Parks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {filteredInstitutions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No institutions found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm || filterType !== "all" 
                        ? "Try adjusting your search or filter criteria."
                        : "Get started by adding your first institution."
                      }
                    </p>
                    {!searchTerm && filterType === "all" && (
                      <Button onClick={() => setShowAddModal(true)} className="cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Institution
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredInstitutions.map((institution) => (
                  <Card key={institution.institutionId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center">
                            <Building2 className="h-5 w-5 mr-2" />
                            {institution.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            <Badge variant="outline" className="mr-2">
                              ID: {institution.institutionId}
                            </Badge>
                            {institution.branches.length} branches
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setSelectedInstitution(institution)
                              setShowAddBranchModal(true)
                            }}
                            className="cursor-pointer"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Branch
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setDeleteTarget({
                                type: 'institution',
                                id: institution.institutionId,
                                name: institution.name
                              })
                              setShowDeleteModal(true)
                            }}
                            className="text-destructive hover:text-destructive bg-transparent cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {institution.institutionDescription || "No description available"}
                      </p>

                      {institution.branches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No branches added yet</p>
                          <p className="text-sm">Click "Add Branch" to create the first branch for this institution</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Branches:</h4>
                          {institution.branches.map((branch) => (
                            <div key={branch.branchId} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h5 className="font-medium text-sm">{branch.name}</h5>
                                  <div
                                    className={`w-2 h-2 rounded-full ${getCrowdColor(branch.currentCrowdLevel)}`}
                                  ></div>
                                  <Badge variant={getCrowdBadgeVariant(branch.currentCrowdLevel)} className="text-xs">
                                    {branch.currentCrowdLevel}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground space-x-4">
                                  <span className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {branch.address || "No address"}
                                  </span>
                                  <span className="flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    {branch.currentCrowdCount}/{branch.capacity || "N/A"}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {branch.serviceHours || "No hours"}
                                  </span>
                                </div>
                                {branch.operatorName && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Operator: {branch.operatorName}
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-destructive cursor-pointer"
                                  onClick={() => {
                                    setDeleteTarget({
                                      type: 'branch',
                                      id: branch.branchId,
                                      name: branch.name
                                    })
                                    setShowDeleteModal(true)
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="branches" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allBranches.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="text-center py-12">
                    <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No branches found</h3>
                    <p className="text-muted-foreground">Add branches to institutions to see them here.</p>
                  </CardContent>
                </Card>
              ) : (
                allBranches.map((branch) => (
                  <Card key={branch.branchId}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{branch.name}</CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Building2 className="h-4 w-4 mr-1" />
                            {branch.institutionName}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {branch.address || "No address"}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getCrowdColor(branch.currentCrowdLevel)}`}></div>
                          <Badge variant={getCrowdBadgeVariant(branch.currentCrowdLevel)}>
                            {branch.currentCrowdLevel}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {branch.currentCrowdCount}/{branch.capacity || "N/A"}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 inline mr-1" />
                        {branch.serviceHours || "No hours"}
                      </div>

                      {branch.operatorName ? (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Operator: </span>
                          <span className="font-medium">{branch.operatorName}</span>
                        </div>
                      ) : (
                        <div className="text-sm text-destructive">No operator assigned</div>
                      )}

                      {branch.serviceDescription && (
                        <div className="text-sm text-muted-foreground">
                          {branch.serviceDescription}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-primary">{processedInstitutions.length}</div>
                  <div className="text-sm text-muted-foreground">Total Institutions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-accent">{allBranches.length}</div>
                  <div className="text-sm text-muted-foreground">Total Branches</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-primary">
                    {allBranches.filter((branch) => branch.operatorName).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Branches with Operators</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-accent">
                    {allBranches.filter((branch) => branch.currentCrowdLevel === "High").length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Crowd Branches</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Institution Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(processedInstitutions.map((inst) => inst.institutionDescription))).map((type) => {
                    if (!type) return null
                    const count = processedInstitutions.filter((inst) => inst.institutionDescription === type).length
                    const branchCount = processedInstitutions
                      .filter((inst) => inst.institutionDescription === type)
                      .reduce((acc, inst) => acc + inst.branches.length, 0)
                    return (
                      <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{type}</div>
                          <div className="text-sm text-muted-foreground">
                            {count} institutions, {branchCount} branches
                          </div>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AddInstitutionModal open={showAddModal} onOpenChange={setShowAddModal} onAdd={handleAddInstitution} />

        <AddBranchModal
          open={showAddBranchModal}
          onOpenChange={setShowAddBranchModal}
          institution={selectedInstitution}
          onAdd={handleAddBranch}
        />

        <DeleteConfirmationModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          title={`Delete ${deleteTarget?.type === 'institution' ? 'Institution' : 'Branch'}`}
          description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.${
            deleteTarget?.type === 'institution' ? ' This will also remove all associated branches.' : ''
          }`}
          onConfirm={() => {
            if (deleteTarget?.type === 'institution') {
              handleDeleteInstitution()
            } else if (deleteTarget?.type === 'branch') {
              handleDeleteBranch()
            }
          }}
        />
      </div>
    </DashboardLayout>
  )
}
