"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface MonthYearPickerProps {
  value?: Date | string
  onChange?: (date: Date) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function MonthYearPicker({
  value,
  onChange,
  placeholder = "Select month",
  className,
  disabled = false,
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<"year" | "month">("year")
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse value to Date
  const parsedValue = React.useMemo(() => {
    if (!value) return null
    if (value instanceof Date) return value
    const parsed = new Date(value)
    return isNaN(parsed.getTime()) ? null : parsed
  }, [value])

  // Selected year and month
  const [selectedYear, setSelectedYear] = useState<number>(
    parsedValue?.getFullYear() ?? new Date().getFullYear()
  )
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    parsedValue?.getMonth() ?? null
  )

  // Year range for display
  const [yearRangeStart, setYearRangeStart] = useState(() => {
    const currentYear = parsedValue?.getFullYear() ?? new Date().getFullYear()
    return Math.floor(currentYear / 12) * 12
  })

  // Sync internal state with prop value
  const syncState = () => {
    if (parsedValue) {
      setSelectedYear(parsedValue.getFullYear())
      setSelectedMonth(parsedValue.getMonth())
      setYearRangeStart(Math.floor(parsedValue.getFullYear() / 12) * 12)
    }
  }

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setView("year")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleYearSelect = (year: number) => {
    setSelectedYear(year)
    setView("month")
  }

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex)
    const newDate = new Date(selectedYear, monthIndex, 1)
    onChange?.(newDate)
    setIsOpen(false)
    setView("year")
  }

  const handlePrevYearRange = () => {
    setYearRangeStart(prev => prev - 12)
  }

  const handleNextYearRange = () => {
    setYearRangeStart(prev => prev + 12)
  }

  const handlePrevYear = () => {
    setSelectedYear(prev => prev - 1)
    setYearRangeStart(Math.floor((selectedYear - 1) / 12) * 12)
  }

  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1)
    setYearRangeStart(Math.floor((selectedYear + 1) / 12) * 12)
  }

  const displayValue = parsedValue
    ? `${parsedValue.getFullYear()}, ${FULL_MONTHS[parsedValue.getMonth()]}`
    : ""

  const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i)

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Input Display */}
      <div
        onClick={() => {
          if (!disabled) {
            if (!isOpen) syncState()
            setIsOpen(!isOpen)
          }
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm cursor-pointer hover:border-gray-300 transition-colors",
          "dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600",
          disabled && "cursor-not-allowed opacity-50",
          isOpen && "border-gray-400 dark:border-gray-500"
        )}
      >
        <span className={cn(
          "text-gray-900 dark:text-gray-100",
          !displayValue && "text-gray-500 dark:text-gray-400"
        )}>
          {displayValue || placeholder}
        </span>
        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full min-w-70 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {view === "year" ? (
            <>
              {/* Year Range Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevYearRange}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {yearRangeStart}-{yearRangeStart + 11}
                </span>
                <button
                  type="button"
                  onClick={handleNextYearRange}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Year Grid */}
              <div className="grid grid-cols-3 gap-2">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className={cn(
                      "h-10 rounded-lg text-sm font-medium transition-colors",
                      year === selectedYear
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Month View Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevYear}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextYear}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Month Grid */}
              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleMonthSelect(index)}
                    className={cn(
                      "h-10 rounded-lg text-sm font-medium transition-colors",
                      selectedMonth === index && selectedYear === parsedValue?.getFullYear()
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    )}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
