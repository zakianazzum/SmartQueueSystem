"use client"
import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Building2, Users, Clock, MapPin, Trash2, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useFavorites, useDeleteFavorite } from "@/hooks/use-favorites"
import { useInstitutions } from "@/hooks/use-institutions"
import { useBranches } from "@/hooks/use-branches"
import { useToast } from "@/hooks/use-toast"
import { FavoriteInstitution } from "@/lib/api"
import { AddToFavoritesModal } from "@/components/add-to-favorites-modal"

export default function FavoritesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // State for add to favorites modal
  const [showAddToFavoritesModal, setShowAddToFavoritesModal] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState<{ name: string; branches: any[] } | null>(null)
  
  // Fetch real data
  const { favorites, loading: favoritesLoading, refetch: refetchFavorites } = useFavorites(user?.visitorId)
  const { institutions, loading: institutionsLoading } = useInstitutions()
  const { branches, loading: branchesLoading } = useBranches()
  const { deleteFavorite, loading: deletingFavorite } = useDeleteFavorite()

  const getFavoriteBranches = () => {
    return favorites
      .map((favorite) => {
        const branch = branches.find((b) => b.branchId === favorite.branchId)
        const institution = institutions.find((i) => i.institutionId === branch?.institutionId)
        return { 
          ...favorite, 
          branch,
          institution
        }
      })
      .filter((item) => item.branch && item.institution)
  }

  const removeFavorite = async (favorite: FavoriteInstitution) => {
    if (!user?.visitorId) {
      toast({
        title: "Authentication error",
        description: "Please log in again to manage favorites.",
        variant: "destructive",
      })
      return
    }

    const success = await deleteFavorite(user.visitorId, favorite.branchId)
    if (success) {
      refetchFavorites()
      toast({ 
        title: "Favorite Removed", 
        description: "Institution has been removed from your favorites." 
      })
    } else {
      toast({ 
        title: "Error", 
        description: "Failed to remove favorite.", 
        variant: "destructive" 
      })
    }
  }

  const handleAddToFavorites = () => {
    if (!user?.visitorId) {
      toast({
        title: "Authentication error",
        description: "Please log in to add favorites.",
        variant: "destructive",
      })
      return
    }

    // Show institution selection or navigate to institutions page
    // For now, let's show a simple modal with institution selection
    const institutionWithBranches = institutions.find(inst => inst.branches.length > 0)
    if (institutionWithBranches) {
      setSelectedInstitution({
        name: institutionWithBranches.name,
        branches: institutionWithBranches.branches
      })
      setShowAddToFavoritesModal(true)
    } else {
      toast({
        title: "No institutions available",
        description: "Please check the institutions page to add favorites.",
        variant: "destructive",
      })
    }
  }

  const handleFavoritesConfirm = () => {
    refetchFavorites()
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

  const favoriteBranches = getFavoriteBranches()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Favorite Institutions</h1>
          <p className="text-muted-foreground mt-2">Quick access to your most visited institutions</p>
        </div>

        {!user?.visitorId ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Please log in</h3>
              <p className="text-muted-foreground mb-6">
                You need to be logged in as a visitor to manage your favorites
              </p>
            </CardContent>
          </Card>
        ) : favoritesLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading favorites...</p>
            </CardContent>
          </Card>
        ) : favoriteBranches.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favoriteBranches.map((item) => (
              <Card key={item.favoriteInstitutionId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center">
                        <Heart className="h-5 w-5 text-red-500 mr-2 fill-current" />
                        {item.branch?.name}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Building2 className="h-4 w-4 mr-1" />
                        {item.institution?.name}
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => removeFavorite(item)}
                      disabled={deletingFavorite}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {item.branch?.address || "Address not available"}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getCrowdColor(item.branch?.currentCrowdLevel || "Unknown")}`}
                      ></div>
                      <Badge variant={item.branch?.currentCrowdLevel === "High" ? "destructive" : "default"}>
                        {item.branch?.currentCrowdLevel || "Unknown"}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {item.branch?.currentCrowdCount || 0} people
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {item.branch?.averageWaitTime || 0} min wait
                    </div>
                    <span className="text-muted-foreground">{item.branch?.serviceHours || "Hours not available"}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {item.branch?.services?.slice(0, 2).map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {item.branch?.services && item.branch.services.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.branch.services.length - 2} more
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
              <Button onClick={handleAddToFavorites} disabled={!user?.visitorId}>
                <Plus className="h-4 w-4 mr-2" />
                Add to Favorites
              </Button>
            </CardContent>
          </Card>
        )}

        {user?.visitorId && favoriteBranches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{favoriteBranches.length}</div>
                  <div className="text-sm text-muted-foreground">Total Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {favoriteBranches.filter((item) => item.branch?.currentCrowdLevel === "Low").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Currently Low</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {favoriteBranches.length > 0
                      ? Math.round(
                          favoriteBranches.reduce((acc, item) => acc + (item.branch?.averageWaitTime || 0), 0) /
                            favoriteBranches.length,
                        )
                      : 0}
                    m
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Wait Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {new Set(favoriteBranches.map((item) => item.institution?.type).filter(Boolean)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Institution Types</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add to Favorites Modal */}
        {selectedInstitution && (
          <AddToFavoritesModal
            institutionName={selectedInstitution.name}
            branches={selectedInstitution.branches}
            isOpen={showAddToFavoritesModal}
            onClose={() => {
              setShowAddToFavoritesModal(false)
              setSelectedInstitution(null)
            }}
            onConfirm={handleFavoritesConfirm}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
