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
import { institutionApi, userApi, type InstitutionCreate, type User } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface AddInstitutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (institution: any) => void
}

export function AddInstitutionModal({ open, onOpenChange, onAdd }: AddInstitutionModalProps) {
  const [loading, setLoading] = useState(false)
  const [administrators, setAdministrators] = useState<User[]>([])
  const [formData, setFormData] = useState({
    name: "",
    institutionTypeId: "",
    administratorId: "",
    institutionDescription: "",
  })
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (open) {
      loadAdministrators()
    }
  }, [open])

  const loadAdministrators = async () => {
    try {
      const users = await userApi.getAll()
      const adminUsers = users.filter((u) => u.role === "administrator")
      setAdministrators(adminUsers)
    } catch (error) {
      console.error("Error loading administrators:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const institutionData: InstitutionCreate = {
        name: formData.name,
        institutionTypeId: Number.parseInt(formData.institutionTypeId),
        administratorId: Number.parseInt(formData.administratorId),
        institutionDescription: formData.institutionDescription,
      }

      const newInstitution = await institutionApi.create(institutionData)

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
    } catch (error) {
      console.error("Error adding institution:", error)
      toast({
        title: "Error",
        description: "Failed to add institution. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
            <Label htmlFor="type">Institution Type ID</Label>
            <Select
              value={formData.institutionTypeId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, institutionTypeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Bank</SelectItem>
                <SelectItem value="2">Government</SelectItem>
                <SelectItem value="3">Park</SelectItem>
                <SelectItem value="4">Hospital</SelectItem>
                <SelectItem value="5">Post Office</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="administrator">Administrator</Label>
            <Select
              value={formData.administratorId}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, administratorId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select administrator" />
              </SelectTrigger>
              <SelectContent>
                {administrators.map((admin) => (
                  <SelectItem key={admin.id} value={admin.id.toString()}>
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
            <Button type="submit" disabled={loading} className="cursor-pointer">
              {loading ? "Adding..." : "Add Institution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
