"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, MapPin, Users, Clock, Eye } from "lucide-react"

interface ViewInstitutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  institution: any
}

export function ViewInstitutionModal({ open, onOpenChange, institution }: ViewInstitutionModalProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            {institution.name}
          </DialogTitle>
          <DialogDescription>Detailed view of institution and all its branches</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Institution Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Institution Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Type: </span>
                <Badge variant="outline">{institution.type}</Badge>
              </div>
              <div>
                <span className="font-medium">Description: </span>
                <span className="text-muted-foreground">{institution.description}</span>
              </div>
              <div>
                <span className="font-medium">Total Branches: </span>
                <span className="text-primary font-semibold">{institution.branches.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Branches */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Branches</h3>
            {institution.branches.map((branch: any) => (
              <Card key={branch.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{branch.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getCrowdColor(branch.currentCrowdLevel)}`}></div>
                      <Badge variant={getCrowdBadgeVariant(branch.currentCrowdLevel)}>{branch.currentCrowdLevel}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {branch.address}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        Capacity: {branch.currentCrowdCount}/{branch.capacity}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{branch.serviceHours}</span>
                    </div>
                  </div>

                  {branch.operatorName && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Operator: </span>
                      <span className="font-medium">{branch.operatorName}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {branch.services.map((service: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
