"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockInstitutions } from "@/lib/mock-data"
import { MapPin, Navigation, Building2, Users, Clock } from "lucide-react"

export default function MapPage() {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interactive Map</h1>
          <p className="text-muted-foreground mt-2">
            Explore institutions on the map and view real-time crowd information
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Live Institution Map
                </CardTitle>
                <CardDescription>Interactive map showing all institutions with real-time crowd data</CardDescription>
              </CardHeader>
              <CardContent className="h-full">
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Map placeholder with mock pins */}
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10"></div>

                  {/* Mock map pins */}
                  {mockInstitutions.map((institution, index) => (
                    <div
                      key={institution.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      style={{
                        left: `${20 + index * 15}%`,
                        top: `${30 + index * 10}%`,
                      }}
                    >
                      <div
                        className={`w-4 h-4 rounded-full ${getCrowdColor(institution.currentCrowdLevel)} border-2 border-white shadow-lg group-hover:scale-125 transition-transform`}
                      ></div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-card border rounded-lg p-2 shadow-lg min-w-48">
                          <p className="font-semibold text-sm">{institution.name}</p>
                          <p className="text-xs text-muted-foreground">{institution.type}</p>
                          <div className="flex items-center mt-1">
                            <div
                              className={`w-2 h-2 rounded-full ${getCrowdColor(institution.currentCrowdLevel)} mr-1`}
                            ></div>
                            <span className="text-xs">
                              {institution.currentCrowdLevel} - {institution.currentCrowdCount} people
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                    <p className="text-muted-foreground mb-4">Hover over the colored pins to see institution details</p>
                    <Button variant="outline">
                      <Navigation className="h-4 w-4 mr-2" />
                      Enable Location
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Institution List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nearby Institutions</CardTitle>
                <CardDescription>Institutions in your area</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockInstitutions.slice(0, 4).map((institution) => (
                  <div key={institution.id} className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{institution.name}</h4>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {institution.type}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getCrowdColor(institution.currentCrowdLevel)}`}></div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        {institution.currentCrowdCount} people
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {institution.averageWaitTime}m wait
                      </div>
                    </div>

                    <Badge variant="outline" className="mt-2 text-xs">
                      {institution.currentCrowdLevel}
                    </Badge>
                  </div>
                ))}
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
