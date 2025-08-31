"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Check } from "lucide-react"

const mockInstitutions = [
  { id: "inst1", name: "First National Bank", type: "Bank" },
  { id: "inst2", name: "City Hall", type: "Government" },
  { id: "inst3", name: "Central Park", type: "Recreation" },
  { id: "inst4", name: "DMV Office", type: "Government" },
]

const mockBranches = [
  { id: "branch1", name: "Downtown Branch", institutionId: "inst1" },
  { id: "branch2", name: "Uptown Branch", institutionId: "inst1" },
  { id: "branch3", name: "Main Office", institutionId: "inst2" },
  { id: "branch4", name: "North Office", institutionId: "inst2" },
  { id: "branch5", name: "Recreation Center", institutionId: "inst3" },
  { id: "branch6", name: "Sports Complex", institutionId: "inst3" },
  { id: "branch7", name: "License Division", institutionId: "inst4" },
  { id: "branch8", name: "Registration Division", institutionId: "inst4" },
]

interface EditOperatorModalProps {
  operator: any
  isOpen: boolean
  onClose: () => void
  onConfirm: (operatorData: any) => void
}

export function EditOperatorModal({ operator, isOpen, onClose, onConfirm }: EditOperatorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    branchId: "",
    institutionId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (operator) {
      setFormData({
        name: operator.name || "",
        email: operator.email || "",
        role: operator.role || "",
        password: "", // Don't pre-fill password for security
        branchId: operator.branchId || "",
        institutionId: operator.institutionId || "",
      })
    }
  }, [operator])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.role) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    onConfirm({ ...operator, ...formData })
    setIsSubmitting(false)
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const filteredBranches = mockBranches.filter((branch) => branch.institutionId === formData.institutionId)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            Edit Operator
          </DialogTitle>
          <DialogDescription>Update operator information and branch assignment</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name *</Label>
            <Input
              id="edit-name"
              placeholder="Enter operator's full name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email Address *</Label>
            <Input
              id="edit-email"
              type="email"
              placeholder="operator@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-role">Role *</Label>
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
            <Label htmlFor="edit-password">New Password</Label>
            <Input
              id="edit-password"
              type="password"
              placeholder="Leave blank to keep current password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-institution">Institution *</Label>
            <Select
              value={formData.institutionId}
              onValueChange={(value) => {
                handleInputChange("institutionId", value)
                handleInputChange("branchId", "")
              }}
            >
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

          <div className="space-y-2">
            <Label htmlFor="edit-branch">Branch Assignment *</Label>
            <Select
              value={formData.branchId}
              onValueChange={(value) => handleInputChange("branchId", value)}
              disabled={!formData.institutionId}
            >
              <SelectTrigger>
                <SelectValue placeholder={!formData.institutionId ? "Select institution first" : "Select branch"} />
              </SelectTrigger>
              <SelectContent>
                {filteredBranches.map((branch) => (
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
              disabled={isSubmitting || !formData.name || !formData.email || !formData.role}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Update Operator
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
