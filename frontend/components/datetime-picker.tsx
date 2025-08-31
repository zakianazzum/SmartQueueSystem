"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  date?: Date
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Pick a date and time",
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [timeValue, setTimeValue] = React.useState(date ? format(date, "HH:mm") : "")

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // If we have a time value, combine it with the selected date
      if (timeValue) {
        const [hours, minutes] = timeValue.split(":").map(Number)
        selectedDate.setHours(hours, minutes)
      }
      onDateChange(selectedDate)
    } else {
      onDateChange(undefined)
    }
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)
    if (date && time) {
      const [hours, minutes] = time.split(":").map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes)
      onDateChange(newDate)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal cursor-pointer",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP HH:mm") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
          <div className="space-y-2">
            <label className="text-sm font-medium">Time</label>
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setIsOpen(false)} className="cursor-pointer">
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
