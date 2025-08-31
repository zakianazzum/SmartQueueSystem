"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Institution, Branch } from "@/lib/api"
import { useInstitutions } from "@/hooks/use-institutions"
import { useBranches } from "@/hooks/use-branches"
import { useCreateOperator } from "@/hooks/use-operators"

interface AddOperatorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (operatorData: any) => void
}

interface OperatorData {
  name: string
  email: string
  role: string
  password: string
  institutionId: string
  branchId: string
}

export function AddOperatorModal({ open, onOpenChange, onConfirm }: AddOperatorModalProps) {
  const [formData, setFormData] = useState<OperatorData>({
    name: "",
    email: "",
    role: "operator",
    password: "",
    institutionId: "",
    branchId: "",
  })
  const { toast } = useToast()
  
  // Use custom hooks
  const { institutions, loading: institutionsLoading } = useInstitutions()
  const { branches, loading: branchesLoading } = useBranches()
  const { createOperator, loading: creatingOperator } = useCreateOperator()

  // Get branches for selected institution
  const availableBranches = branches.filter(branch => branch.institutionId === formData.institutionId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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

    if (!formData.password.trim()) {
      toast({
        title: "Error",
        description: "Password is required.",
        variant: "destructive",
      })
      return
    }

    try {
      const operatorData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        branchId: formData.branchId || undefined,
      }

      const newOperator = await createOperator(operatorData)

      if (newOperator) {
        onConfirm(newOperator)

        toast({
          title: "Operator Added",
          description: `${formData.name} has been successfully added as an operator.`,
        })

        // Reset form
        setFormData({
          name: "",
          email: "",
          role: "operator",
          password: "",
          institutionId: "",
          branchId: "",
        })

        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error adding operator:", error)
      toast({
        title: "Error",
        description: "Failed to add operator. Please try again.",
        variant: "destructive",
      })
    }
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Label htmlFor="institution">Institution</Label>
            <Select 
              value={formData.institutionId} 
              onValueChange={(value) => handleInputChange("institutionId", value)}
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
            <Label htmlFor="branch">Branch Assignment</Label>
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
              disabled={creatingOperator}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 cursor-pointer"
              disabled={creatingOperator || !formData.name || !formData.email || !formData.password}
            >
              {creatingOperator ? (
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
