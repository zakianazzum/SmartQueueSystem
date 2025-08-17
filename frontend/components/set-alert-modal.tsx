"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, Check } from "lucide-react"

interface SetAlertModalProps {
  institutionName: string
  isOpen: boolean
  onClose: () => void
  onConfirm: (alertSettings: AlertSettings) => void
}

interface AlertSettings {
  crowdLevel: string
  emailNotifications: boolean
  pushNotifications: boolean
}

export function SetAlertModal({ institutionName, isOpen, onClose, onConfirm }: SetAlertModalProps) {
  const [crowdLevel, setCrowdLevel] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!crowdLevel) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onConfirm({
      crowdLevel,
      emailNotifications,
      pushNotifications,
    })

    // Reset form
    setCrowdLevel("")
    setEmailNotifications(true)
    setPushNotifications(true)
    setIsSubmitting(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Set Alert
          </DialogTitle>
          <DialogDescription>Get notified when "{institutionName}" meets your criteria</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crowd-level">Alert me when crowd level is:</Label>
            <Select value={crowdLevel} onValueChange={setCrowdLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select crowd level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (Best time to visit)</SelectItem>
                <SelectItem value="medium">Medium or below</SelectItem>
                <SelectItem value="high">High (Avoid visiting)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Notification Preferences</Label>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-sm font-normal">
                  Email Notifications
                </Label>
                <p className="text-xs text-muted-foreground">Receive alerts via email</p>
              </div>
              <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="text-sm font-normal">
                  Push Notifications
                </Label>
                <p className="text-xs text-muted-foreground">Receive instant push notifications</p>
              </div>
              <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 cursor-pointer bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 cursor-pointer" disabled={isSubmitting || !crowdLevel}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Alert
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
