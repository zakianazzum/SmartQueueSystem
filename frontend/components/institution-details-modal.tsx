"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, MapPin, Clock, Users, Phone, Globe, Heart, Bell } from "lucide-react"

interface InstitutionType {
  institutionTypeId: string
  institutionType: string
}

interface Branch {
  branchId: string
  institutionId: string
  name: string
  branchDescription?: string
  address?: string
  serviceHours?: string
  serviceDescription?: string
  latitude?: number
  longitude?: number
  capacity?: number
  totalCrowdCount?: number
}

interface Institution {
  institutionId: string
  institutionTypeId?: string
  administratorId?: string
  name: string
  institutionDescription?: string
  institutionType?: InstitutionType
  branches: Branch[]
}

interface InstitutionDetailsModalProps {
  institution: Institution | null
  isOpen: boolean
  onClose: () => void
  onAddToFavorites: (institutionId: string) => void
  onSetAlert: (institutionId: string) => void
}

export function InstitutionDetailsModal({
  institution,
  isOpen,
  onClose,
  onAddToFavorites,
  onSetAlert,
}: InstitutionDetailsModalProps) {
  if (!institution) return null

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {institution.name}
          </DialogTitle>
          <DialogDescription>Detailed information about this institution</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{institution.institutionType?.institutionType || "Unknown Type"}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  {institution.branches.reduce((sum, branch) => sum + (branch.totalCrowdCount || 0), 0)} people total
                </div>
              </div>

              {institution.institutionDescription && (
                <div className="text-sm text-muted-foreground">
                  <p>{institution.institutionDescription}</p>
                </div>
              )}

              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{institution.branches.length} branch{institution.branches.length !== 1 ? 'es' : ''}</span>
              </div>
            </CardContent>
          </Card>

          {/* Branches */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Branches</h3>
              <div className="space-y-3">
                {institution.branches.map((branch) => {
                  const crowdCount = branch.totalCrowdCount || 0
                  const crowdLevel = crowdCount === 0 ? "Low" : 
                    crowdCount < 20 ? "Low" : 
                    crowdCount < 50 ? "Medium" : "High"
                  
                  return (
                    <div key={branch.branchId} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{branch.name}</h4>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getCrowdColor(crowdLevel)}`}></div>
                          <Badge variant={getCrowdBadgeVariant(crowdLevel)} className="text-xs">
                            {crowdLevel}
                          </Badge>
                        </div>
                      </div>
                      
                      {branch.address && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{branch.address}</span>
                        </div>
                      )}
                      
                      {branch.serviceHours && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{branch.serviceHours}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{branch.totalCrowdCount || 0} people</span>
                        {branch.capacity && (
                          <span className="ml-2">(Capacity: {branch.capacity})</span>
                        )}
                      </div>
                      
                      {branch.branchDescription && (
                        <p className="text-sm text-muted-foreground">{branch.branchDescription}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => onAddToFavorites(institution.institutionId)}
              variant="outline"
              className="flex-1 cursor-pointer"
            >
              <Heart className="h-4 w-4 mr-2" />
              Add to Favorites
            </Button>
            <Button onClick={() => onSetAlert(institution.institutionId)} variant="outline" className="flex-1 cursor-pointer">
              <Bell className="h-4 w-4 mr-2" />
              Set Alert
            </Button>
          </div>

          <Button onClick={onClose} className="w-full cursor-pointer">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
