"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockAdminInstitutions } from "@/lib/admin-data"
import { Building2, MapPin, Users, Clock, Plus, Edit, Trash2, Eye } from "lucide-react"

export default function InstitutionsAdminPage() {
  const [institutions, setInstitutions] = useState(mockAdminInstitutions)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const filteredInstitutions = institutions.filter((institution) => {
    const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || institution.type.toLowerCase() === filterType.toLowerCase()
    return matchesSearch && matchesType
  })

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
    return institutions.flatMap((institution) =>
      institution.branches.map((branch) => ({
        ...branch,
        institutionName: institution.name,
        institutionType: institution.type,
      })),
    )
  }

  const allBranches = getAllBranches()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Institution Management</h1>
            <p className="text-muted-foreground mt-2">Manage institutions, branches, and their configurations</p>
          </div>
          <Button>
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
            {/* Search and Filter */}
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

            {/* Institutions List */}
            <div className="space-y-4">
              {filteredInstitutions.map((institution) => (
                <Card key={institution.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Building2 className="h-5 w-5 mr-2" />
                          {institution.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          <Badge variant="outline" className="mr-2">
                            {institution.type}
                          </Badge>
                          {institution.branches.length} branches
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive bg-transparent"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{institution.description}</p>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Branches:</h4>
                      {institution.branches.map((branch) => (
                        <div key={branch.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-medium text-sm">{branch.name}</h5>
                              <div className={`w-2 h-2 rounded-full ${getCrowdColor(branch.currentCrowdLevel)}`}></div>
                              <Badge variant={getCrowdBadgeVariant(branch.currentCrowdLevel)} className="text-xs">
                                {branch.currentCrowdLevel}
                              </Badge>
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground space-x-4">
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {branch.address}
                              </span>
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {branch.currentCrowdCount}/{branch.capacity}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {branch.serviceHours}
                              </span>
                            </div>
                            {branch.operatorName && (
                              <div className="text-xs text-muted-foreground mt-1">Operator: {branch.operatorName}</div>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="branches" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allBranches.map((branch) => (
                <Card key={branch.id}>
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
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {branch.address}
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
                        {branch.currentCrowdCount}/{branch.capacity}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {branch.serviceHours}
                    </div>

                    {branch.operatorName ? (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Operator: </span>
                        <span className="font-medium">{branch.operatorName}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-destructive">No operator assigned</div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {branch.services.slice(0, 2).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {branch.services.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{branch.services.length - 2}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-primary">{institutions.length}</div>
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
                    {allBranches.filter((branch) => branch.operatorId).length}
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
                  {Array.from(new Set(institutions.map((inst) => inst.type))).map((type) => {
                    const count = institutions.filter((inst) => inst.type === type).length
                    const branchCount = institutions
                      .filter((inst) => inst.type === type)
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
      </div>
    </DashboardLayout>
  )
}
