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
import { Institution, Branch } from "@/lib/api"
import { useCreateBranch } from "@/hooks/use-branches"

interface AddBranchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  institution: Institution | null
  onAdd: (institutionId: string, branch: Branch) => void
}

export function AddBranchModal({ open, onOpenChange, institution, onAdd }: AddBranchModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    branchDescription: "",
    address: "",
    serviceHours: "",
    serviceDescription: "",
    capacity: "",
    latitude: "",
    longitude: "",
  })
  const { toast } = useToast()
  const { createBranch, loading } = useCreateBranch()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!institution) {
      toast({
        title: "Error",
        description: "No institution selected.",
        variant: "destructive",
      })
      return
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Branch name is required.",
        variant: "destructive",
      })
      return
    }

    if (!formData.address.trim()) {
      toast({
        title: "Error",
        description: "Branch address is required.",
        variant: "destructive",
      })
      return
    }

    try {
      const branchData = {
        institutionId: institution.institutionId,
        name: formData.name.trim(),
        branchDescription: formData.branchDescription.trim() || undefined,
        address: formData.address.trim(),
        serviceHours: formData.serviceHours.trim() || undefined,
        serviceDescription: formData.serviceDescription.trim() || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      }

      const newBranch = await createBranch(branchData)

      if (newBranch) {
        onAdd(institution.institutionId, newBranch)

        toast({
          title: "Branch Added",
          description: `${formData.name} has been successfully added to ${institution.name}.`,
        })

        // Reset form
        setFormData({
          name: "",
          branchDescription: "",
          address: "",
          serviceHours: "",
          serviceDescription: "",
          capacity: "",
          latitude: "",
          longitude: "",
        })

        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error adding branch:", error)
      toast({
        title: "Error",
        description: "Failed to add branch. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!institution) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Add Branch to {institution.name}
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
              value={formData.branchDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, branchDescription: e.target.value }))}
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
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceDescription">Service Description</Label>
            <Textarea
              id="serviceDescription"
              value={formData.serviceDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, serviceDescription: e.target.value }))}
              placeholder="e.g., Banking services, ATM, Customer support"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                placeholder="e.g., 23.7501726"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                placeholder="e.g., 90.3854392"
              />
            </div>
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
