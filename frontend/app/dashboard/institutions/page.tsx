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
import { mockInstitutions } from "@/lib/mock-data"
import { Building2, MapPin, Clock, Users, Heart, Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function InstitutionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterCrowd, setFilterCrowd] = useState("all")
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFavoritesModal, setShowFavoritesModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const { toast } = useToast()

  const filteredInstitutions = mockInstitutions.filter((institution) => {
    const matchesSearch =
      institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institution.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || institution.type.toLowerCase() === filterType.toLowerCase()
    const matchesCrowd =
      filterCrowd === "all" || institution.currentCrowdLevel.toLowerCase() === filterCrowd.toLowerCase()

    return matchesSearch && matchesType && matchesCrowd
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

  const handleViewDetails = (institution: any) => {
    setSelectedInstitution(institution)
    setShowDetailsModal(true)
  }

  const handleAddToFavorites = (institutionId: string) => {
    const institution = mockInstitutions.find((i) => i.id === institutionId)
    if (institution) {
      setSelectedInstitution(institution)
      setShowFavoritesModal(true)
    }
  }

  const handleSetAlert = (institutionId: string) => {
    const institution = mockInstitutions.find((i) => i.id === institutionId)
    if (institution) {
      setSelectedInstitution(institution)
      setShowAlertModal(true)
    }
  }

  const handleFavoritesConfirm = (notes: string) => {
    toast({
      title: "Added to Favorites",
      description: `${selectedInstitution?.name} has been added to your favorites.`,
    })
  }

  const handleAlertConfirm = (alertSettings: any) => {
    toast({
      title: "Alert Created",
      description: `You'll be notified when ${selectedInstitution?.name} has ${alertSettings.crowdLevel} crowd levels.`,
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Institutions</h1>
          <p className="text-muted-foreground mt-2">
            View real-time crowd levels at various institutions and plan your visits
          </p>
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
                  placeholder="Search institutions or addresses..."
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
              <Select value={filterCrowd} onValueChange={setFilterCrowd}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by crowd" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Institutions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredInstitutions.map((institution) => (
            <Card key={institution.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{institution.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Building2 className="h-4 w-4 mr-1" />
                      {institution.type}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 cursor-pointer"
                      onClick={() => handleAddToFavorites(institution.id)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 cursor-pointer"
                      onClick={() => handleSetAlert(institution.id)}
                    >
                      <Bell className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {institution.address}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getCrowdColor(institution.currentCrowdLevel)}`}></div>
                    <Badge variant={getCrowdBadgeVariant(institution.currentCrowdLevel)}>
                      {institution.currentCrowdLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {institution.currentCrowdCount} people
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {institution.averageWaitTime} min wait
                  </div>
                  <span className="text-muted-foreground">{institution.serviceHours}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {institution.services.slice(0, 2).map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {institution.services.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{institution.services.length - 2} more
                    </Badge>
                  )}
                </div>

                <Button className="w-full cursor-pointer" size="sm" onClick={() => handleViewDetails(institution)}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInstitutions.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No institutions found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms or filters to find institutions.</p>
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
