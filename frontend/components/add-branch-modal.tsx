"use client"
import { useState } from "react"
import type React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MapPin } from "lucide-react"

interface AddBranchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  institution: any
  onAdd: (institutionId: string, branch: any) => void
}

export function AddBranchModal({ open, onOpenChange, institution, onAdd }: AddBranchModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    serviceHours: "",
    capacity: "",
    services: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newBranch = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name,
        description: formData.description,
        address: formData.address,
        serviceHours: formData.serviceHours,
        capacity: Number.parseInt(formData.capacity),
        currentCrowdCount: Math.floor(Math.random() * Number.parseInt(formData.capacity)),
        currentCrowdLevel: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        services: formData.services
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        operatorId: null,
        operatorName: null,
        latitude: 23.7501726 + (Math.random() - 0.5) * 0.1,
        longitude: 90.3854392 + (Math.random() - 0.5) * 0.1,
      }

      onAdd(institution.id, newBranch)

      toast({
        title: "Branch Added",
        description: `${formData.name} has been successfully added to ${institution.name}.`,
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        address: "",
        serviceHours: "",
        capacity: "",
        services: "",
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add branch. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Add Branch to {institution?.name}
          </DialogTitle>
          <DialogDescription>Add a new branch location for this institution.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="branchName">Branch Name</Label>
            <Input
              id="branchName"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Downtown Branch, Main Office"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branchDescription">Branch Description</Label>
            <Textarea
              id="branchDescription"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this branch"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="e.g., 123 Main St, Downtown"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceHours">Service Hours</Label>
              <Input
                id="serviceHours"
                value={formData.serviceHours}
                onChange={(e) => setFormData((prev) => ({ ...prev, serviceHours: e.target.value }))}
                placeholder="e.g., 9:00 AM - 5:00 PM"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
                placeholder="e.g., 50"
                required
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="services">Services (comma-separated)</Label>
            <Input
              id="services"
              value={formData.services}
              onChange={(e) => setFormData((prev) => ({ ...prev, services: e.target.value }))}
              placeholder="e.g., Banking, ATM, Loans, Customer Service"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="cursor-pointer">
              {loading ? "Adding..." : "Add Branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
