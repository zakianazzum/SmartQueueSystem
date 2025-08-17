"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Check } from "lucide-react"

interface AddOperatorModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (operatorData: OperatorData) => void
}

interface OperatorData {
  name: string
  email: string
  phone: string
  branchId: string
  institutionId: string
}

export function AddOperatorModal({ isOpen, onClose, onConfirm }: AddOperatorModalProps) {
  const [formData, setFormData] = useState<OperatorData>({
    name: "",
    email: "",
    phone: "",
    branchId: "",
    institutionId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    onConfirm(formData)

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      branchId: "",
      institutionId: "",
    })
    setIsSubmitting(false)
    onClose()
  }

  const handleInputChange = (field: keyof OperatorData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add New Operator
          </DialogTitle>
          <DialogDescription>Create a new operator account and assign them to a branch</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Enter operator's full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="operator@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <Select value={formData.institutionId} onValueChange={(value) => handleInputChange("institutionId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select institution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inst1">First National Bank</SelectItem>
                <SelectItem value="inst2">City Hall</SelectItem>
                <SelectItem value="inst3">Central Park</SelectItem>
                <SelectItem value="inst4">DMV Office</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch Assignment</Label>
            <Select value={formData.branchId} onValueChange={(value) => handleInputChange("branchId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="branch1">Downtown Branch</SelectItem>
                <SelectItem value="branch2">Uptown Branch</SelectItem>
                <SelectItem value="branch3">West Side Branch</SelectItem>
                <SelectItem value="branch4">East Side Branch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 cursor-pointer bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 cursor-pointer"
              disabled={isSubmitting || !formData.name || !formData.email}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Add Operator
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
