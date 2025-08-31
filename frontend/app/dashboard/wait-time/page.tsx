"use client"
import { useState } from "react"
import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/date-picker"
import { useInstitutions } from "@/hooks/use-institutions"
import { useBranches } from "@/hooks/use-branches"
import { useCreateWaitTimePrediction, useWaitTimePredictionsByVisitor } from "@/hooks/use-wait-time-predictions"
import { WaitTimePrediction } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Clock, TrendingUp, Calendar, Users, BarChart3 } from "lucide-react"

export default function WaitTimePage() {
  const [selectedInstitution, setSelectedInstitution] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [prediction, setPrediction] = useState<WaitTimePrediction | null>(null)
  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false)
  
  const { institutions, loading: institutionsLoading } = useInstitutions()
  const { branches, loading: branchesLoading } = useBranches()
  const { createPrediction, loading: isCreating, error: createError } = useCreateWaitTimePrediction()
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Fetch user's historical predictions
  const { predictions: userPredictions, loading: predictionsLoading, refetch: refetchPredictions } = useWaitTimePredictionsByVisitor(user?.visitorId || "")

  const generatePrediction = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedInstitution || !selectedBranch || !selectedDate || !selectedTime) {
      toast({
        title: "Missing information",
        description: "Please select institution, branch, date, and time.",
        variant: "destructive",
      })
      return
    }

    // Get visitor ID from auth context
    const visitorId = user?.visitorId || user?.userId

    if (!visitorId) {
      toast({
        title: "Authentication error",
        description: "Please log in again to use this feature.",
        variant: "destructive",
      })
      return
    }

    // Create a combined date and time
    const combinedDate = new Date(selectedDate)
    const [hours, minutes] = selectedTime.split(":").map(Number)
    combinedDate.setHours(hours, minutes, 0, 0)

    const result = await createPrediction({
      visitorId: visitorId,
      branchId: selectedBranch,
      visitDate: combinedDate.toISOString(),
    })

    if (result) {
      setPrediction(result)
      setPredictionDialogOpen(false)
      // Refetch user's predictions to update the recent predictions list
      refetchPredictions()
    }
  }

  const getConfidenceColor = (accuracy: number) => {
    if (accuracy >= 90) return "text-green-500"
    if (accuracy >= 80) return "text-yellow-500"
    return "text-red-500"
  }

  const getCrowdLevel = (waitTime: number) => {
    if (waitTime <= 10) return "Low"
    if (waitTime <= 25) return "Medium"
    return "High"
  }

  const getCrowdColor = (level: string) => {
    switch (level) {
      case "Low":
        return "text-green-500"
      case "Medium":
        return "text-yellow-500"
      case "High":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getRecommendation = (waitTime: number) => {
    if (waitTime > 30) {
      return "Consider visiting at a different time for shorter wait"
    } else if (waitTime > 15) {
      return "Moderate wait time expected"
    } else {
      return "Great time to visit!"
    }
  }

  // Filter branches based on selected institution
  const filteredBranches = branches.filter(
    (branch) => !selectedInstitution || branch.institutionId === selectedInstitution
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Wait Time Prediction</h1>
            <p className="text-muted-foreground mt-2">
              AI-powered predictions to help you plan your visits and minimize waiting time
            </p>
          </div>
          <Dialog open={predictionDialogOpen} onOpenChange={setPredictionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer">
                <TrendingUp className="h-4 w-4 mr-2" />
                New Prediction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Predict Wait Time</DialogTitle>
                <DialogDescription>
                  Select an institution, date, and time to get an AI-powered wait time prediction.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={generatePrediction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Select 
                    value={selectedInstitution} 
                    onValueChange={(value) => {
                      setSelectedInstitution(value)
                      setSelectedBranch("") // Reset branch selection when institution changes
                    }}
                    disabled={institutionsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={institutionsLoading ? "Loading..." : "Select institution"} />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((institution) => (
                        <SelectItem key={institution.institutionId} value={institution.institutionId}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select 
                    value={selectedBranch} 
                    onValueChange={setSelectedBranch}
                    disabled={!selectedInstitution || branchesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedInstitution 
                          ? "Please select an institution first" 
                          : branchesLoading 
                            ? "Loading..." 
                            : "Select branch"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredBranches.map((branch) => (
                        <SelectItem key={branch.branchId} value={branch.branchId}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <DatePicker
                      date={selectedDate}
                      onDateChange={setSelectedDate}
                      placeholder="Select visit date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                        <SelectItem value="13:00">1:00 PM</SelectItem>
                        <SelectItem value="14:00">2:00 PM</SelectItem>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPredictionDialogOpen(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!selectedBranch || !selectedDate || !selectedTime || isCreating}
                    className="cursor-pointer"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Generate Prediction
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Prediction Results */}
        {prediction && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Latest Prediction Results
              </CardTitle>
              <CardDescription>Based on historical data and current patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{prediction.predictedWaitTime} min</div>
                  <div className="text-sm text-muted-foreground">Predicted Wait Time</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${getConfidenceColor(prediction.accuracy)}`}>
                    {prediction.accuracy}%
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy Level</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${getCrowdColor(getCrowdLevel(prediction.predictedWaitTime))}`}>
                    {getCrowdLevel(prediction.predictedWaitTime)}
                  </div>
                  <div className="text-sm text-muted-foreground">Expected Crowd</div>
                </div>
                <div className="text-center">
                  <Badge
                    variant={
                      prediction.predictedWaitTime > 30 ? "destructive" : prediction.predictedWaitTime > 15 ? "secondary" : "default"
                    }
                    className="text-sm"
                  >
                    {prediction.predictedWaitTime > 30 ? "Busy" : prediction.predictedWaitTime > 15 ? "Moderate" : "Optimal"}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-2">Visit Rating</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Recommendation</h4>
                <p className="text-sm text-muted-foreground">{getRecommendation(prediction.predictedWaitTime)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {createError && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <p className="font-semibold">Error generating prediction</p>
                <p className="text-sm">{createError}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historical Data */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Predictions</CardTitle>
              <CardDescription>Your recent wait time predictions</CardDescription>
            </CardHeader>
            <CardContent>
              {!user?.visitorId ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Please log in to view your predictions</p>
                </div>
              ) : predictionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading predictions...</p>
                </div>
              ) : userPredictions.length > 0 ? (
                <div className="space-y-3">
                  {userPredictions.slice(0, 5).map((prediction) => (
                    <div key={prediction.waitTimePredictionId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="text-sm font-medium">
                          {new Date(prediction.visitDate).toLocaleDateString()} at {new Date(prediction.visitDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {prediction.predictedWaitTime} min wait • {prediction.accuracy}% accuracy
                        </div>
                      </div>
                      <Badge variant={prediction.predictedWaitTime > 30 ? "destructive" : prediction.predictedWaitTime > 15 ? "secondary" : "default"}>
                        {getCrowdLevel(prediction.predictedWaitTime)}
                      </Badge>
                    </div>
                  ))}
                  {userPredictions.length > 5 && (
                    <div className="text-center py-2">
                      <p className="text-xs text-muted-foreground">
                        Showing 5 of {userPredictions.length} predictions
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No predictions yet</p>
                  <p className="text-sm">Generate your first prediction to see it here</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
              <CardDescription>Optimize your visit timing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Best Times to Visit</h4>
                  <p className="text-sm text-muted-foreground">Early morning (9-10 AM) or late afternoon (4-5 PM)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Avoid Peak Hours</h4>
                  <p className="text-sm text-muted-foreground">Lunch time (12-2 PM) typically has the highest crowds</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Weekday vs Weekend</h4>
                  <p className="text-sm text-muted-foreground">Weekdays generally have more predictable patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
