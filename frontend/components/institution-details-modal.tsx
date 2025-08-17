"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, MapPin, Clock, Users, Phone, Globe, Heart, Bell } from "lucide-react"

interface Institution {
  id: string
  name: string
  type: string
  address: string
  currentCrowdLevel: string
  currentCrowdCount: number
  averageWaitTime: number
  serviceHours: string
  services: string[]
  phone?: string
  website?: string
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
                  <div className={`w-3 h-3 rounded-full ${getCrowdColor(institution.currentCrowdLevel)}`}></div>
                  <Badge variant={getCrowdBadgeVariant(institution.currentCrowdLevel)}>
                    {institution.currentCrowdLevel} Crowd Level
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  {institution.currentCrowdCount} people currently
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{institution.averageWaitTime} min average wait</span>
                </div>
                <div className="flex items-center text-sm">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{institution.type}</span>
                </div>
              </div>

              <div className="flex items-start text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                <span>{institution.address}</span>
              </div>

              <div className="text-sm">
                <span className="font-medium">Service Hours: </span>
                <span className="text-muted-foreground">{institution.serviceHours}</span>
              </div>

              {institution.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{institution.phone}</span>
                </div>
              )}

              {institution.website && (
                <div className="flex items-center text-sm">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a
                    href={institution.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline cursor-pointer"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Available Services</h3>
              <div className="flex flex-wrap gap-2">
                {institution.services.map((service, index) => (
                  <Badge key={index} variant="outline">
                    {service}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => onAddToFavorites(institution.id)}
              variant="outline"
              className="flex-1 cursor-pointer"
            >
              <Heart className="h-4 w-4 mr-2" />
              Add to Favorites
            </Button>
            <Button onClick={() => onSetAlert(institution.id)} variant="outline" className="flex-1 cursor-pointer">
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
