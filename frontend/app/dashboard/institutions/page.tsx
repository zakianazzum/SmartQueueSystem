"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InstitutionDetailsModal } from "@/components/institution-details-modal"
import { AddToFavoritesModal } from "@/components/add-to-favorites-modal"
import { SetAlertModal } from "@/components/set-alert-modal"
import { useInstitutions } from "@/hooks/use-institutions"
import { Institution } from "@/lib/api"
import { Building2, MapPin, Clock, Users, Heart, Bell, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function InstitutionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFavoritesModal, setShowFavoritesModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  
  const { institutions, loading, error, refetch } = useInstitutions()
  const { toast } = useToast()

  // Filter institutions based on search and type
  const filteredInstitutions = institutions.filter((institution) => {
    const matchesSearch =
      institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.institutionDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.branches.some(branch => 
        branch.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesType = filterType === "all" || 
      institution.institutionType?.institutionType.toLowerCase() === filterType.toLowerCase()

    return matchesSearch && matchesType
  })

  // Get unique institution types for filter
  const institutionTypes = Array.from(
    new Set(
      institutions
        .map(inst => inst.institutionType?.institutionType)
        .filter(Boolean)
    )
  )

  // Calculate crowd level based on total crowd count
  const getCrowdLevel = (institution: Institution) => {
    const totalCrowd = institution.branches.reduce((sum, branch) => sum + (branch.totalCrowdCount || 0), 0)
    if (totalCrowd === 0) return "Low"
    if (totalCrowd < 20) return "Low"
    if (totalCrowd < 50) return "Medium"
    return "High"
  }

  // Get crowd color for display
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

  // Get crowd badge variant
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

  // Get total crowd count for institution
  const getTotalCrowdCount = (institution: Institution) => {
    return institution.branches.reduce((sum, branch) => sum + (branch.totalCrowdCount || 0), 0)
  }

  // Get primary branch for display
  const getPrimaryBranch = (institution: Institution) => {
    return institution.branches[0] || null
  }

  const handleViewDetails = (institution: Institution) => {
    setSelectedInstitution(institution)
    setShowDetailsModal(true)
  }

  const handleAddToFavorites = (institutionId: string) => {
    const institution = institutions.find((i) => i.institutionId === institutionId)
    if (institution) {
      setSelectedInstitution(institution)
      setShowFavoritesModal(true)
    }
  }

  const handleSetAlert = (institutionId: string) => {
    const institution = institutions.find((i) => i.institutionId === institutionId)
    if (institution) {
      setSelectedInstitution(institution)
      setShowAlertModal(true)
    }
  }

  const handleFavoritesConfirm = () => {
    // The modal now handles the API call internally
    // This function is called after successful addition
  }

  const handleAlertConfirm = (alertSettings: any) => {
    toast({
      title: "Alert Created",
      description: `You'll be notified when ${selectedInstitution?.name} has ${alertSettings.crowdLevel} crowd levels.`,
    })
  }

  const handleRefresh = async () => {
    await refetch()
    toast({
      title: "Refreshed",
      description: "Institution data has been updated.",
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Institutions</h1>
            <p className="text-muted-foreground mt-2">
              View real-time crowd levels at various institutions and plan your visits
            </p>
          </div>
          
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading institutions...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Institutions</h1>
            <p className="text-muted-foreground mt-2">
              View real-time crowd levels at various institutions and plan your visits
            </p>
          </div>
          
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading institutions</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Institutions</h1>
            <p className="text-muted-foreground mt-2">
              View real-time crowd levels at various institutions and plan your visits
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search institutions, descriptions, or addresses..."
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
                  {institutionTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Institutions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredInstitutions.map((institution) => {
            const crowdLevel = getCrowdLevel(institution)
            const totalCrowdCount = getTotalCrowdCount(institution)
            const primaryBranch = getPrimaryBranch(institution)
            
            return (
              <Card key={institution.institutionId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{institution.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building2 className="h-4 w-4 mr-1" />
                        {institution.institutionType?.institutionType || "Unknown Type"}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 cursor-pointer"
                        onClick={() => handleAddToFavorites(institution.institutionId)}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 cursor-pointer"
                        onClick={() => handleSetAlert(institution.institutionId)}
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {primaryBranch?.address && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {primaryBranch.address}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getCrowdColor(crowdLevel)}`}></div>
                      <Badge variant={getCrowdBadgeVariant(crowdLevel)}>
                        {crowdLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {totalCrowdCount} people
                    </div>
                  </div>

                  {primaryBranch?.serviceHours && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        Service Hours
                      </div>
                      <span className="text-muted-foreground">{primaryBranch.serviceHours}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {institution.branches.length} branch{institution.branches.length !== 1 ? 'es' : ''}
                    </Badge>
                    {institution.institutionDescription && (
                      <Badge variant="outline" className="text-xs">
                        {institution.institutionDescription.length > 20 
                          ? `${institution.institutionDescription.substring(0, 20)}...`
                          : institution.institutionDescription
                        }
                      </Badge>
                    )}
                  </div>

                  <Button 
                    className="w-full cursor-pointer" 
                    size="sm" 
                    onClick={() => handleViewDetails(institution)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredInstitutions.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No institutions found</h3>
              <p className="text-muted-foreground">
                {institutions.length === 0 
                  ? "No institutions are available at the moment."
                  : "Try adjusting your search terms or filters to find institutions."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <InstitutionDetailsModal
        institution={selectedInstitution}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onAddToFavorites={handleAddToFavorites}
        onSetAlert={handleSetAlert}
      />

      <AddToFavoritesModal
        institutionName={selectedInstitution?.name || ""}
        branches={selectedInstitution?.branches || []}
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        onConfirm={handleFavoritesConfirm}
      />

      <SetAlertModal
        institutionName={selectedInstitution?.name || ""}
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        onConfirm={handleAlertConfirm}
      />
    </DashboardLayout>
  )
}
