"use client"

import * as React from "react"
import { DayPicker, DateRange } from "react-day-picker"
import { format, isWithinInterval, startOfDay, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

interface FlightCalendarProps {
  className?: string
  classNames?: Record<string, string>
  showOutsideDays?: boolean
  dateRange: DateRange | undefined
  onSelect: (range: DateRange | undefined) => void
  defaultMonth?: Date
  numberOfMonths?: number
  initialFocus?: boolean
  onClose?: () => void
}

export function FlightCalendar({
  className,
  classNames,
  showOutsideDays = true,
  dateRange,
  onSelect,
  onClose,
  ...props
}: FlightCalendarProps) {
  return (
    <div className="flex flex-col">
      <DayPicker
        mode="range"
        selected={dateRange}
        onSelect={onSelect}
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
            "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
          ),
          day: cn(
            "h-9 w-9 p-0 font-normal",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:bg-accent focus-visible:text-accent-foreground"
          ),
          day_selected: cn(
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          ),
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50",
          day_hidden: "invisible",
          day_range_start: "rounded-l-md bg-primary text-primary-foreground",
          day_range_end: "rounded-r-md bg-primary text-primary-foreground",
          day_range_middle: "bg-accent/50",
          ...classNames,
        }}
        components={{
          Footer: () => (
            <div className="space-y-4 p-4 border-t">
              <div className="text-xs text-muted-foreground">
                {dateRange?.from && dateRange?.to && (
                  <>
                    {format(dateRange.from, "MMMM d, yyyy")} - {format(dateRange.to, "MMMM d, yyyy")}
                    <br />
                    {differenceInDays(dateRange.to, dateRange.from) + 1} days in destination
                  </>
                )}
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={onClose}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            </div>
          ),
        }}
        {...props}
      />
    </div>
  )
} 