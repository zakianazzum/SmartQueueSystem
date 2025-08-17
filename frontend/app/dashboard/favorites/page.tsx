"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockFavorites, mockInstitutions } from "@/lib/mock-data"
import { Heart, Building2, Users, Clock, MapPin, Trash2 } from "lucide-react"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(mockFavorites)

  const getFavoriteInstitutions = () => {
    return favorites
      .map((favorite) => {
        const institution = mockInstitutions.find((inst) => inst.id === favorite.institutionId)
        return { ...favorite, institution }
      })
      .filter((item) => item.institution)
  }

  const removeFavorite = (favoriteId: string) => {
    setFavorites(favorites.filter((fav) => fav.id !== favoriteId))
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

  const favoriteInstitutions = getFavoriteInstitutions()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Favorite Institutions</h1>
          <p className="text-muted-foreground mt-2">Quick access to your most visited institutions</p>
        </div>

        {favoriteInstitutions.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favoriteInstitutions.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center">
                        <Heart className="h-5 w-5 text-red-500 mr-2 fill-current" />
                        {item.institution.name}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building2 className="h-4 w-4 mr-1" />
                        {item.institution.type}
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => removeFavorite(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {item.institution.address}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getCrowdColor(item.institution.currentCrowdLevel)}`}
                      ></div>
                      <Badge variant={item.institution.currentCrowdLevel === "High" ? "destructive" : "default"}>
                        {item.institution.currentCrowdLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {item.institution.currentCrowdCount} people
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {item.institution.averageWaitTime} min wait
                    </div>
                    <span className="text-muted-foreground">{item.institution.serviceHours}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {item.institution.services.slice(0, 2).map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {item.institution.services.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.institution.services.length - 2} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Get Directions
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Added on {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-6">Start adding institutions to your favorites for quick access</p>
              <Button>Browse Institutions</Button>
            </CardContent>
          </Card>
        )}

        {favoriteInstitutions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{favoriteInstitutions.length}</div>
                  <div className="text-sm text-muted-foreground">Total Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {favoriteInstitutions.filter((item) => item.institution.currentCrowdLevel === "Low").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Currently Low</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(
                      favoriteInstitutions.reduce((acc, item) => acc + item.institution.averageWaitTime, 0) /
                        favoriteInstitutions.length,
                    )}
                    m
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Wait Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {new Set(favoriteInstitutions.map((item) => item.institution.type)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Institution Types</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
