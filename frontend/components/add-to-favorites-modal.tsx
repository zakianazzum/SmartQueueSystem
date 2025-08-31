"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Heart, Check } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useCreateFavorite } from "@/hooks/use-favorites"
import { useToast } from "@/hooks/use-toast"
import { Branch } from "@/lib/api"

interface AddToFavoritesModalProps {
  institutionName: string
  branches: Branch[]
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function AddToFavoritesModal({ 
  institutionName, 
  branches, 
  isOpen, 
  onClose, 
  onConfirm 
}: AddToFavoritesModalProps) {
  const [selectedBranchId, setSelectedBranchId] = useState("")
  const { user } = useAuth()
  const { createFavorite, loading: isCreating } = useCreateFavorite()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedBranchId) {
      toast({
        title: "Please select a branch",
        description: "You must select a branch to add to favorites.",
        variant: "destructive",
      })
      return
    }

    if (!user?.visitorId) {
      toast({
        title: "Authentication error",
        description: "Please log in again to add favorites.",
        variant: "destructive",
      })
      return
    }

    const result = await createFavorite({
      visitorId: user.visitorId,
      branchId: selectedBranchId,
    })

    if (result) {
      toast({
        title: "Added to Favorites",
        description: "Branch has been added to your favorites successfully.",
      })
      setSelectedBranchId("")
      onConfirm()
      onClose()
    } else {
      toast({
        title: "Error",
        description: "Failed to add branch to favorites.",
        variant: "destructive",
      })
    }
  }

  const handleClose = () => {
    setSelectedBranchId("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Add to Favorites
          </DialogTitle>
          <DialogDescription>
            Add a branch from "{institutionName}" to your favorites list
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="branch">Select Branch</Label>
            <Select
              value={selectedBranchId}
              onValueChange={setSelectedBranchId}
              disabled={isCreating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a branch to favorite" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.branchId} value={branch.branchId}>
                    {branch.name}
                    {branch.address && ` - ${branch.address}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 cursor-pointer bg-transparent"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 cursor-pointer" disabled={isCreating || !selectedBranchId}>
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Add to Favorites
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
