"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { mockInstitutions } from "@/lib/mock-data"
import { mockDailyAnalytics } from "@/lib/admin-data"
import { Filter, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AnalyticsFilterDialogProps {
  onApplyFilters: (filteredData: any[]) => void
}

export function AnalyticsFilterDialog({ onApplyFilters }: AnalyticsFilterDialogProps) {
  const [open, setOpen] = useState(false)
  const [filterPeriod, setFilterPeriod] = useState("")
  const [minThreshold, setMinThreshold] = useState("")
  const [maxThreshold, setMaxThreshold] = useState("")
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([])
  const { toast } = useToast()

  const handleInstitutionToggle = (institutionId: string) => {
    setSelectedInstitutions((prev) =>
      prev.includes(institutionId) ? prev.filter((id) => id !== institutionId) : [...prev, institutionId],
    )
  }

  const removeInstitution = (institutionId: string) => {
    setSelectedInstitutions((prev) => prev.filter((id) => id !== institutionId))
  }

  const generateFilteredData = () => {
    const minCount = minThreshold ? Number.parseInt(minThreshold) : 0
    const maxCount = maxThreshold ? Number.parseInt(maxThreshold) : 200

    let baseData = [...mockDailyAnalytics]

    // Apply period filter
    if (filterPeriod === "daily") {
      baseData = baseData.slice(-1)
    } else if (filterPeriod === "weekly") {
      baseData = baseData.slice(-7)
    } else if (filterPeriod === "monthly") {
      // Generate more data for monthly view
      baseData = [
        ...baseData,
        { date: "Dec 15", institutions: 3, operators: 8, updates: 145, visitors: 289 },
        { date: "Dec 16", institutions: 3, operators: 7, updates: 167, visitors: 312 },
        { date: "Dec 17", institutions: 3, operators: 9, updates: 134, visitors: 278 },
        { date: "Dec 18", institutions: 3, operators: 8, updates: 189, visitors: 345 },
        { date: "Dec 19", institutions: 3, operators: 8, updates: 156, visitors: 298 },
        { date: "Dec 20", institutions: 3, operators: 9, updates: 178, visitors: 334 },
      ]
    }

    // Apply crowd count thresholds
    let filtered = baseData.filter((day) => {
      return day.updates >= minCount && day.updates <= maxCount
    })

    // If institutions are selected, modify data to reflect institution-specific analytics
    if (selectedInstitutions.length > 0) {
      filtered = filtered.map((day) => ({
        ...day,
        institutions: selectedInstitutions.length,
        updates: Math.floor(day.updates * (selectedInstitutions.length / mockInstitutions.length)),
        visitors: Math.floor(day.visitors * (selectedInstitutions.length / mockInstitutions.length)),
        operators: Math.min(day.operators, selectedInstitutions.length * 3), // Assume max 3 operators per institution
      }))
    }

    return filtered
  }

  const applyFilters = () => {
    const filteredData = generateFilteredData()
    onApplyFilters(filteredData)

    toast({
      title: "Filters Applied",
      description: `Analytics updated with ${filteredData.length} entries based on your filters.`,
    })

    setOpen(false)
  }

  const resetFilters = () => {
    setFilterPeriod("")
    setMinThreshold("")
    setMaxThreshold("")
    setSelectedInstitutions([])
    onApplyFilters(mockDailyAnalytics)

    toast({
      title: "Filters Reset",
      description: "All filters have been cleared and analytics reset to default view.",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Filter className="h-4 w-4 mr-2" />
          Filter Analytics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Analytics Filters</DialogTitle>
          <DialogDescription>Filter analytics data by period, crowd thresholds, and institutions</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Period Filter */}
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min Threshold */}
            <div className="space-y-2">
              <Label htmlFor="min-threshold">Min Crowd Count</Label>
              <Input
                id="min-threshold"
                type="number"
                placeholder="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
              />
            </div>

            {/* Max Threshold */}
            <div className="space-y-2">
              <Label htmlFor="max-threshold">Max Crowd Count</Label>
              <Input
                id="max-threshold"
                type="number"
                placeholder="200"
                value={maxThreshold}
                onChange={(e) => setMaxThreshold(e.target.value)}
              />
            </div>
          </div>

          {/* Institution Multi-Select */}
          <div className="space-y-3">
            <Label>Select Institutions</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {mockInstitutions.map((institution) => (
                <div key={institution.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={institution.id}
                    checked={selectedInstitutions.includes(institution.id)}
                    onCheckedChange={() => handleInstitutionToggle(institution.id)}
                  />
                  <Label htmlFor={institution.id} className="text-sm cursor-pointer flex-1">
                    {institution.name}
                  </Label>
                </div>
              ))}
            </div>

            {/* Selected Institutions Display */}
            {selectedInstitutions.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Institutions:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedInstitutions.map((institutionId) => {
                    const institution = mockInstitutions.find((inst) => inst.id === institutionId)
                    return (
                      <Badge key={institutionId} variant="secondary" className="flex items-center gap-1">
                        {institution?.name}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeInstitution(institutionId)}
                        />
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={resetFilters} className="cursor-pointer bg-transparent">
              Reset Filters
            </Button>
            <Button onClick={applyFilters} className="cursor-pointer">
              Show Analytics
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
