"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Operator, Institution, Branch } from "@/lib/api"
import { useInstitutions } from "@/hooks/use-institutions"
import { useBranches } from "@/hooks/use-branches"
import { useUpdateOperator } from "@/hooks/use-operators"

interface EditOperatorModalProps {
  operator: Operator | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (operatorData: Operator) => void
}

export function EditOperatorModal({ operator, open, onOpenChange, onConfirm }: EditOperatorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    branchId: "",
    institutionId: "",
  })
  const { toast } = useToast()
  
  // Use custom hooks
  const { institutions, loading: institutionsLoading } = useInstitutions()
  const { branches, loading: branchesLoading } = useBranches()
  const { updateOperator, loading: updatingOperator } = useUpdateOperator()

  useEffect(() => {
    if (operator) {
      setFormData({
        name: operator.name || "",
        email: operator.email || "",
        role: operator.role || "operator",
        password: "", // Don't pre-fill password for security
        branchId: operator.branchId || "",
        institutionId: operator.branch?.branchId ? 
          branches.find(b => b.branchId === operator.branchId)?.institutionId || "" : "",
      })
    }
  }, [operator, branches])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!operator) return

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Operator name is required.",
        variant: "destructive",
      })
      return
    }

    if (!formData.email.trim()) {
      toast({
        title: "Error",
        description: "Email is required.",
        variant: "destructive",
      })
      return
    }

    try {
      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
      }

      // Only include password if it's provided
      if (formData.password.trim()) {
        updateData.password = formData.password
      }

      // Only include branchId if it's provided
      if (formData.branchId) {
        updateData.branchId = formData.branchId
      }

      const updatedOperator = await updateOperator(operator.userId, updateData)

      if (updatedOperator) {
        onConfirm(updatedOperator)

        toast({
          title: "Operator Updated",
          description: `${formData.name}'s information has been updated.`,
        })

        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error updating operator:", error)
      toast({
        title: "Error",
        description: "Failed to update operator. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (field === "institutionId") {
        return { ...prev, [field]: value, branchId: "" }
      }
      return { ...prev, [field]: value }
    })
  }

  // Get branches for selected institution
  const availableBranches = branches.filter(branch => branch.institutionId === formData.institutionId)

  if (!operator) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Label htmlFor="edit-institution">Institution</Label>
            <Select
              value={formData.institutionId}
              onValueChange={(value) => {
                handleInputChange("institutionId", value)
                handleInputChange("branchId", "")
              }}
              disabled={institutionsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={institutionsLoading ? "Loading institutions..." : "Select institution (optional)"} />
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
            <Label htmlFor="edit-branch">Branch Assignment</Label>
            <Select
              value={formData.branchId}
              onValueChange={(value) => handleInputChange("branchId", value)}
              disabled={!formData.institutionId || branchesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !formData.institutionId 
                    ? "Select institution first" 
                    : branchesLoading 
                      ? "Loading branches..." 
                      : "Select branch (optional)"
                } />
              </SelectTrigger>
              <SelectContent>
                {availableBranches.map((branch) => (
                  <SelectItem key={branch.branchId} value={branch.branchId}>
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
              onClick={() => onOpenChange(false)}
              className="flex-1 cursor-pointer bg-transparent"
              disabled={updatingOperator}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 cursor-pointer"
              disabled={updatingOperator || !formData.name || !formData.email}
            >
              {updatingOperator ? (
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
