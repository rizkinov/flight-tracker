"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface YearSelectorProps {
  selectedYear: number
  availableYears: number[]
  onYearChange: (year: number) => void
}

export function YearSelector({ selectedYear, availableYears, onYearChange }: YearSelectorProps) {
  const sortedYears = [...availableYears].sort((a, b) => a - b)
  const currentIndex = sortedYears.indexOf(selectedYear)
  const canGoBack = currentIndex > 0
  const canGoForward = currentIndex < sortedYears.length - 1

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => canGoBack && onYearChange(sortedYears[currentIndex - 1])}
        disabled={!canGoBack}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium tabular-nums min-w-[4ch] text-center">
        {selectedYear}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => canGoForward && onYearChange(sortedYears[currentIndex + 1])}
        disabled={!canGoForward}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
