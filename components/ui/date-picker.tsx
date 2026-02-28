"use client"

import * as React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"

interface DatePickerProps {
  value?: Date | string | null
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

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<"year" | "month" | "day">("day")
  const [displayYear, setDisplayYear] = useState(() => new Date().getFullYear())
  const [displayMonth, setDisplayMonth] = useState(() => new Date().getMonth())
  const [yearRangeStart, setYearRangeStart] = useState(() =>
    Math.floor(new Date().getFullYear() / 12) * 12
  )
  const [mounted, setMounted] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Parse value to Date
  const parsedValue = React.useMemo(() => {
    if (!value) return null
    if (value instanceof Date) return value
    if (typeof value === "string" && value.trim()) {
      const parts = value.split("-")
      if (parts.length === 3) {
        const year = parseInt(parts[0])
        const month = parseInt(parts[1]) - 1
        const day = parseInt(parts[2])
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          return new Date(year, month, day)
        }
      }
      const parsed = new Date(value)
      return !isNaN(parsed.getTime()) ? parsed : null
    }
    return null
  }, [value])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync display state with value
  useEffect(() => {
    if (parsedValue) {
      setDisplayYear(parsedValue.getFullYear())
      setDisplayMonth(parsedValue.getMonth())
      setYearRangeStart(Math.floor(parsedValue.getFullYear() / 12) * 12)
    }
  }, [parsedValue])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setView("day")
      }
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [isOpen])

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const generateCalendarDays = useCallback(() => {
    const daysInMonth = getDaysInMonth(displayYear, displayMonth)
    const firstDay = getFirstDayOfMonth(displayYear, displayMonth)
    const daysInPrevMonth = getDaysInMonth(displayYear, displayMonth - 1)

    const days: { day: number; isCurrentMonth: boolean }[] = []

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, isCurrentMonth: false })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true })
    }

    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false })
    }

    return days
  }, [displayYear, displayMonth])

  const displayValue = parsedValue
    ? `${parsedValue.getFullYear()}-${String(parsedValue.getMonth() + 1).padStart(2, "0")}-${String(parsedValue.getDate()).padStart(2, "0")}`
    : ""

  const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i)
  const calendarDays = generateCalendarDays()

  const isToday = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || !mounted) return false
    const today = new Date()
    return (
      day === today.getDate() &&
      displayMonth === today.getMonth() &&
      displayYear === today.getFullYear()
    )
  }

  const isSelected = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || !parsedValue) return false
    return (
      day === parsedValue.getDate() &&
      displayMonth === parsedValue.getMonth() &&
      displayYear === parsedValue.getFullYear()
    )
  }

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm cursor-pointer hover:border-gray-300 transition-colors",
          "dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600",
          disabled && "cursor-not-allowed opacity-50",
          isOpen && "border-gray-400 dark:border-gray-500"
        )}
      >
        <span
          className={cn(
            "text-gray-900 dark:text-gray-100",
            !displayValue && "text-gray-500 dark:text-gray-400"
          )}
        >
          {displayValue || placeholder}
        </span>
        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full left-0 z-50 mt-2 w-full min-w-[300px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {view === "year" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setYearRangeStart((p) => p - 12)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium">
                  {yearRangeStart}-{yearRangeStart + 11}
                </span>
                <button
                  type="button"
                  onClick={() => setYearRangeStart((p) => p + 12)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => {
                      setDisplayYear(year)
                      setView("month")
                    }}
                    className={cn(
                      "h-10 rounded-lg text-sm font-medium transition-colors",
                      year === displayYear
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === "month" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setDisplayYear((p) => p - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium">{displayYear}</span>
                <button
                  type="button"
                  onClick={() => setDisplayYear((p) => p + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((month, index) => (
                  <button
                    key={month}
                    type="button"
                    onClick={() => {
                      setDisplayMonth(index)
                      setView("day")
                    }}
                    className={cn(
                      "h-10 rounded-lg text-sm font-medium transition-colors",
                      displayMonth === index
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    )}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === "day" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => {
                    if (displayMonth === 0) {
                      setDisplayMonth(11)
                      setDisplayYear((p) => p - 1)
                    } else {
                      setDisplayMonth((p) => p - 1)
                    }
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView("year")}
                  className="text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {FULL_MONTHS[displayMonth]} {displayYear}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (displayMonth === 11) {
                      setDisplayMonth(0)
                      setDisplayYear((p) => p + 1)
                    } else {
                      setDisplayMonth((p) => p + 1)
                    }
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(({ day, isCurrentMonth }, index) => (
                  <button
                    key={index}
                    type="button"
                    disabled={!isCurrentMonth}
                    onClick={() => {
                      if (isCurrentMonth) {
                        const dateString = `${displayYear}-${String(displayMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                        const newDate = new Date(dateString)
                        onChange?.(newDate)
                        setIsOpen(false)
                      }
                    }}
                    className={cn(
                      "h-8 w-8 rounded-lg text-sm flex items-center justify-center mx-auto transition-colors",
                      !isCurrentMonth && "text-gray-300 dark:text-gray-600 cursor-not-allowed",
                      isCurrentMonth &&
                        !isSelected(day, isCurrentMonth) &&
                        !isToday(day, isCurrentMonth) &&
                        "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                      isSelected(day, isCurrentMonth) &&
                        "bg-gray-900 text-white dark:bg-white dark:text-gray-900",
                      isToday(day, isCurrentMonth) &&
                        !isSelected(day, isCurrentMonth) &&
                        "border border-gray-900 dark:border-white"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
