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
import { mockInstitutions, mockCrowdHistory } from "@/lib/mock-data"
import { Clock, TrendingUp, Calendar, Users, BarChart3 } from "lucide-react"

export default function WaitTimePage() {
  const [selectedInstitution, setSelectedInstitution] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [prediction, setPrediction] = useState<{
    waitTime: number
    confidence: number
    crowdLevel: string
    recommendation: string
  } | null>(null)
  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const generatePrediction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedInstitution && selectedDate && selectedTime) {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock prediction logic
      const institution = mockInstitutions.find((inst) => inst.id === selectedInstitution)
      const timeHour = Number.parseInt(selectedTime.split(":")[0])

      let waitTime = 15
      let crowdLevel = "Medium"
      let confidence = 85

      // Simulate different wait times based on time of day
      if (timeHour >= 12 && timeHour <= 14) {
        waitTime = 35
        crowdLevel = "High"
        confidence = 92
      } else if (timeHour >= 9 && timeHour <= 11) {
        waitTime = 25
        crowdLevel = "Medium"
        confidence = 88
      } else {
        waitTime = 10
        crowdLevel = "Low"
        confidence = 78
      }

      const recommendation =
        waitTime > 30
          ? "Consider visiting at a different time for shorter wait"
          : waitTime > 15
            ? "Moderate wait time expected"
            : "Great time to visit!"

      setPrediction({
        waitTime,
        confidence,
        crowdLevel,
        recommendation,
      })

      setIsLoading(false)
      setPredictionDialogOpen(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-500"
    if (confidence >= 80) return "text-yellow-500"
    return "text-red-500"
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
                  <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockInstitutions.map((institution) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Select value={selectedDate} onValueChange={setSelectedDate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="day-after">Day After Tomorrow</SelectItem>
                      </SelectContent>
                    </Select>
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
                    disabled={!selectedInstitution || !selectedDate || !selectedTime || isLoading}
                    className="cursor-pointer"
                  >
                    {isLoading ? (
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
                  <div className="text-3xl font-bold text-primary mb-2">{prediction.waitTime} min</div>
                  <div className="text-sm text-muted-foreground">Predicted Wait Time</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${getConfidenceColor(prediction.confidence)}`}>
                    {prediction.confidence}%
                  </div>
                  <div className="text-sm text-muted-foreground">Confidence Level</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${getCrowdColor(prediction.crowdLevel)}`}>
                    {prediction.crowdLevel}
                  </div>
                  <div className="text-sm text-muted-foreground">Expected Crowd</div>
                </div>
                <div className="text-center">
                  <Badge
                    variant={
                      prediction.waitTime > 30 ? "destructive" : prediction.waitTime > 15 ? "secondary" : "default"
                    }
                    className="text-sm"
                  >
                    {prediction.waitTime > 30 ? "Busy" : prediction.waitTime > 15 ? "Moderate" : "Optimal"}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-2">Visit Rating</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Recommendation</h4>
                <p className="text-sm text-muted-foreground">{prediction.recommendation}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historical Data */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Busiest Hours Today</CardTitle>
              <CardDescription>Average crowd levels throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCrowdHistory["1"]?.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{data.timestamp}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            data.crowdLevel === "High"
                              ? "bg-red-500"
                              : data.crowdLevel === "Medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${(data.crowdCount / 30) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-12">{data.crowdCount}</span>
                    </div>
                  </div>
                ))}
              </div>
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
