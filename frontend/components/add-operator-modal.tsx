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
  role: string
  password: string
  institutionId: string
  branchId: string
}

export function AddOperatorModal({ isOpen, onClose, onConfirm }: AddOperatorModalProps) {
  const [formData, setFormData] = useState<OperatorData>({
    name: "",
    email: "",
    role: "",
    password: "",
    institutionId: "",
    branchId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const institutions = [
    {
      id: "inst1",
      name: "First National Bank",
      branches: [
        { id: "branch1", name: "Downtown Branch" },
        { id: "branch2", name: "Uptown Branch" },
      ],
    },
    {
      id: "inst2",
      name: "City Hall",
      branches: [
        { id: "branch3", name: "Main Office" },
        { id: "branch4", name: "Annex Building" },
      ],
    },
    {
      id: "inst3",
      name: "Central Park",
      branches: [
        { id: "branch5", name: "North Entrance" },
        { id: "branch6", name: "South Entrance" },
      ],
    },
    {
      id: "inst4",
      name: "DMV Office",
      branches: [
        { id: "branch7", name: "West Side Branch" },
        { id: "branch8", name: "East Side Branch" },
      ],
    },
  ]

  const availableBranches = institutions.find((inst) => inst.id === formData.institutionId)?.branches || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.role || !formData.password) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    onConfirm(formData)

    // Reset form
    setFormData({
      name: "",
      email: "",
      role: "",
      password: "",
      institutionId: "",
      branchId: "",
    })
    setIsSubmitting(false)
    onClose()
  }

  const handleInputChange = (field: keyof OperatorData, value: string) => {
    setFormData((prev) => {
      if (field === "institutionId") {
        return { ...prev, [field]: value, branchId: "" }
      }
      return { ...prev, [field]: value }
    })
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
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter operator's full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
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
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter temporary password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">Institution *</Label>
            <Select value={formData.institutionId} onValueChange={(value) => handleInputChange("institutionId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select institution" />
              </SelectTrigger>
              <SelectContent>
                {institutions.map((institution) => (
                  <SelectItem key={institution.id} value={institution.id}>
                    {institution.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch *</Label>
            <Select
              value={formData.branchId}
              onValueChange={(value) => handleInputChange("branchId", value)}
              disabled={!formData.institutionId}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.institutionId ? "Select branch" : "Select institution first"} />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
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
              disabled={isSubmitting || !formData.name || !formData.email || !formData.role || !formData.password}
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
