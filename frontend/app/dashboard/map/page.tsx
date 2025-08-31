"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Building2, Users, Clock } from "lucide-react"
import { GoogleMap, type GoogleMapRef } from "@/components/google-map"
import { EnhancedSearchDialog } from "@/components/enhanced-search-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRef } from "react"
import { useBranches } from "@/hooks/use-branches"
import { Branch } from "@/lib/api"

export default function MapPage() {
  const GOOGLE_MAPS_API_KEY = "AIzaSyBfl7DeQ3KQOnNpYixs6__bo3TNy-tDjYc"
  const { toast } = useToast()
  const mapRef = useRef<GoogleMapRef>(null)
  const { branches, loading: branchesLoading, error: branchesError } = useBranches()

  const getCrowdLevel = (crowdCount: number | undefined) => {
    if (!crowdCount) return "Unknown"
    if (crowdCount <= 10) return "Low"
    if (crowdCount <= 25) return "Medium"
    return "High"
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

  const handleEnableLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("[v0] User location:", position.coords.latitude, position.coords.longitude)
          mapRef.current?.centerOnUserLocation(position.coords.latitude, position.coords.longitude)
          toast({
            title: "Location Enabled",
            description: `Centered map on your location`,
          })
        },
        (error) => {
          console.log("[v0] Location error:", error)
          toast({
            title: "Location Permission Required",
            description: "Please enable location services to center the map on your location.",
            variant: "destructive",
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      })
    }
  }

  const handleBranchSelect = (branch: Branch) => {
    console.log("[v0] Selected branch:", branch)
    mapRef.current?.addPinAndZoom(branch)
    toast({
      title: "Branch Found",
      description: `Showing ${branch.name} on the map`,
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Interactive Map</h1>
            <p className="text-muted-foreground mt-2">
              Explore institutions on the map and view real-time crowd information
            </p>
          </div>
          <EnhancedSearchDialog onBranchSelect={handleBranchSelect} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Live Institution Map
                </CardTitle>
                <CardDescription>
                  Interactive Google Maps showing all institutions with real-time crowd data
                </CardDescription>
              </CardHeader>
              <CardContent className="h-full p-0">
                <div className="relative h-full">
                  <GoogleMap 
                    ref={mapRef} 
                    apiKey={GOOGLE_MAPS_API_KEY} 
                    branches={branches}
                    className="w-full h-full rounded-b-lg" 
                  />
                  <div className="absolute bottom-4 left-4">
                    <Button variant="secondary" size="sm" onClick={handleEnableLocation} className="cursor-pointer">
                      <Navigation className="h-4 w-4 mr-2" />
                      Enable Location
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nearby Branches</CardTitle>
                <CardDescription>Branches in your area</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {branchesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading branches...</p>
                  </div>
                ) : branchesError ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-destructive">Error loading branches</p>
                  </div>
                ) : branches.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No branches found</p>
                  </div>
                ) : (
                  branches.slice(0, 4).map((branch) => {
                    const crowdLevel = getCrowdLevel(branch.totalCrowdCount)
                    return (
                      <div 
                        key={branch.branchId} 
                        className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleBranchSelect(branch)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-sm">{branch.name}</h4>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {branch.address || "No address"}
                            </p>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getCrowdColor(crowdLevel)}`}></div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center text-muted-foreground">
                            <Users className="h-3 w-3 mr-1" />
                            {branch.totalCrowdCount || 0} people
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Building2 className="h-3 w-3 mr-1" />
                            Branch
                          </div>
                        </div>

                        <Badge variant="outline" className="mt-2 text-xs">
                          {crowdLevel}
                        </Badge>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Map Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Low Crowd (0-10 people)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Medium Crowd (11-25 people)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">High Crowd (25+ people)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
