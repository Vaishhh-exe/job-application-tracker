"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Clock, ChevronDown } from "lucide-react"

interface TimePickerProps {
  value?: string // "HH:mm" format (24-hour)
  onChange?: (time: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function TimePicker({
  value = "",
  onChange,
  placeholder = "Select time",
  className,
  disabled = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [hourDropdownOpen, setHourDropdownOpen] = useState(false)
  const [minuteDropdownOpen, setMinuteDropdownOpen] = useState(false)

  // Parse value to hour, minute, period
  const parseTime = (timeStr: string): { hour: number; minute: number; period: "AM" | "PM" } => {
    if (!timeStr) return { hour: 10, minute: 0, period: "AM" }
    const [hourStr, minuteStr] = timeStr.split(":")
    const hour24 = parseInt(hourStr, 10)
    const minute = parseInt(minuteStr, 10)
    const period: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM"
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    return { hour: hour12, minute, period }
  }

  const parsed = parseTime(value)
  const [hour, setHour] = useState(() => parsed.hour)
  const [minute, setMinute] = useState(() => parsed.minute)
  const [period, setPeriod] = useState<"AM" | "PM">(() => parsed.period)

  // Sync internal state with prop
  const syncState = () => {
    const newParsed = parseTime(value)
    setHour(newParsed.hour)
    setMinute(newParsed.minute)
    setPeriod(newParsed.period)
  }

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setHourDropdownOpen(false)
        setMinuteDropdownOpen(false)
      }
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [isOpen])

  const formatTo24Hour = (h: number, m: number, p: "AM" | "PM") => {
    let hour24 = h
    if (p === "AM" && h === 12) hour24 = 0
    else if (p === "PM" && h !== 12) hour24 = h + 12
    return `${hour24.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  }

  const formatDisplayTime = () => {
    if (!value) return ""
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${period}`
  }

  const handleApply = () => {
    const time24 = formatTo24Hour(hour, minute, period)
    onChange?.(time24)
    setIsOpen(false)
  }

  const handleCancel = () => {
    syncState()
    setIsOpen(false)
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!isOpen) syncState()
          setIsOpen(!isOpen)
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
          !value && "text-gray-500 dark:text-gray-400"
        )}>
          {formatDisplayTime() || placeholder}
        </span>
        <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 z-50 mt-2 w-full min-w-[260px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Select Time
          </div>

          {/* Time Selectors */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {/* Hour Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setHourDropdownOpen(!hourDropdownOpen)
                  setMinuteDropdownOpen(false)
                }}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors",
                  hourDropdownOpen
                    ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                )}
              >
                <span className="font-medium">{hour.toString().padStart(2, "0")}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {hourDropdownOpen && (
                <div className="absolute top-full left-0 z-10 mt-1 max-h-48 w-16 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => {
                        setHour(h)
                        setHourDropdownOpen(false)
                      }}
                      className={cn(
                        "w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-600",
                        hour === h && "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      )}
                    >
                      {h.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-xl font-medium text-gray-500 dark:text-gray-400">:</span>

            {/* Minute Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMinuteDropdownOpen(!minuteDropdownOpen)
                  setHourDropdownOpen(false)
                }}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors",
                  minuteDropdownOpen
                    ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                )}
              >
                <span className="font-medium">{minute.toString().padStart(2, "0")}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {minuteDropdownOpen && (
                <div className="absolute top-full left-0 z-10 mt-1 max-h-48 w-16 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMinute(m)
                        setMinuteDropdownOpen(false)
                      }}
                      className={cn(
                        "w-full px-3 py-1.5 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-600",
                        minute === m && "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      )}
                    >
                      {m.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AM/PM Toggle */}
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                onClick={() => setPeriod("AM")}
                className={cn(
                  "px-2 py-1 text-sm font-medium rounded transition-colors",
                  period === "AM"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => setPeriod("PM")}
                className={cn(
                  "px-2 py-1 text-sm font-medium rounded transition-colors",
                  period === "PM"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                )}
              >
                PM
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors dark:text-blue-400 dark:hover:text-blue-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
