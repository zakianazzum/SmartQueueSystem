"use client"
import { useState, useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import { Institution, InstitutionType, User } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useCreateInstitution } from "@/hooks/use-institutions"
import { useInstitutionTypes } from "@/hooks/use-institution-types"

interface AddInstitutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (institution: Institution) => void
}

export function AddInstitutionModal({ open, onOpenChange, onAdd }: AddInstitutionModalProps) {
  const [administrators, setAdministrators] = useState<User[]>([])
  const [formData, setFormData] = useState({
    name: "",
    institutionTypeId: "",
    administratorId: "",
    institutionDescription: "",
  })
  const { toast } = useToast()
  const { user } = useAuth()
  
  // Use custom hooks
  const { createInstitution, loading } = useCreateInstitution()
  const { institutionTypes, loading: typesLoading } = useInstitutionTypes()

  useEffect(() => {
    if (open) {
      loadAdministrators()
    }
  }, [open])

  const loadAdministrators = async () => {
    try {
      // For now, we'll use the current user as administrator
      // In a real app, you'd fetch administrators from the API
      if (user && user.role === "administrator") {
        setAdministrators([user])
        setFormData(prev => ({ ...prev, administratorId: user.userId }))
      }
    } catch (error) {
      console.error("Error loading administrators:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Institution name is required.",
        variant: "destructive",
      })
      return
    }

    if (!formData.institutionTypeId) {
      toast({
        title: "Error",
        description: "Please select an institution type.",
        variant: "destructive",
      })
      return
    }

    try {
      const institutionData = {
        name: formData.name.trim(),
        institutionTypeId: formData.institutionTypeId,
        administratorId: formData.administratorId || user?.userId,
        institutionDescription: formData.institutionDescription.trim() || undefined,
      }

      const newInstitution = await createInstitution(institutionData)

      if (newInstitution) {
        onAdd(newInstitution)

        toast({
          title: "Institution Added",
          description: `${formData.name} has been successfully added. You can now add branches to this institution.`,
        })

        // Reset form
        setFormData({
          name: "",
          institutionTypeId: "",
          administratorId: "",
          institutionDescription: "",
        })

        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error adding institution:", error)
      toast({
        title: "Error",
        description: "Failed to add institution. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add New Institution
          </DialogTitle>
          <DialogDescription>Create a new institution. You can add branches to it afterwards.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Institution Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Central Bank"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Institution Type</Label>
            <Select
              value={formData.institutionTypeId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, institutionTypeId: value }))}
              disabled={typesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={typesLoading ? "Loading types..." : "Select institution type"} />
              </SelectTrigger>
              <SelectContent>
                {institutionTypes.map((type) => (
                  <SelectItem key={type.institutionTypeId} value={type.institutionTypeId}>
                    {type.institutionType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="administrator">Administrator</Label>
            <Select
              value={formData.administratorId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, administratorId: value }))}
              disabled={administrators.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={administrators.length === 0 ? "No administrators available" : "Select administrator"} />
              </SelectTrigger>
              <SelectContent>
                {administrators.map((admin) => (
                  <SelectItem key={admin.userId} value={admin.userId}>
                    {admin.name} ({admin.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.institutionDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, institutionDescription: e.target.value }))}
              placeholder="Brief description of the institution"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || typesLoading} className="cursor-pointer">
              {loading ? "Adding..." : "Add Institution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
