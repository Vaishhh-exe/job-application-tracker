"use client"

import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusPill } from "@/components/StatusPill"
import { FollowUpBadge, FollowUpDot } from "@/components/FollowUpBadge"

import { Application } from "@/types/application"
import { useView } from "@/app/applications/layout"

interface ApplicationsTableProps {
  applications: Application[]
  onEdit?: (app: Application) => void
  onDelete?: (app: Application) => void
  onRowClick?: (app: Application) => void
}

function DropdownMenu({ 
  onEdit, 
  onDelete,
}: { 
  onEdit: () => void
  onDelete: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
        aria-label="Menu"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-10">
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 rounded-t-md"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
              setIsOpen(false)
            }}
          >
            Edit
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 rounded-b-md"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
              setIsOpen(false)
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "ghosted", label: "Ghosted" },
  { value: "needs-followup", label: "Needs Follow-up" },
]

function StatusFilterPopover({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const hasFilter = value !== ""

  return (
    <div className="relative inline-flex" ref={menuRef}>
      <button
        className={`flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 ${hasFilter ? "text-blue-600 dark:text-blue-400" : ""}`}
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
      >
        <span>Status</span>
        <Filter className={`h-3 w-3 ${hasFilter ? "fill-current" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg z-10">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 ${
                value === option.value ? "bg-gray-100 dark:bg-gray-700" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onChange(option.value)
                setIsOpen(false)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function formatSalary(salary: number | null | undefined, currency: string | null | undefined): string {
  if (!salary) return "-"
  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    CAD: "C$",
    AUD: "A$",
  }
  const currencySymbol = currencySymbols[currency || "USD"] || "$"
  return `${currencySymbol}${salary.toLocaleString()}`
}

export function ApplicationsTable({
  applications = [],
  onEdit,
  onDelete,
  onRowClick,
}: ApplicationsTableProps) {
  const {
    statusFilter,
    setStatusFilter,
    salarySortOrder,
    setSalarySortOrder,
  } = useView()

  const handleSalarySortToggle = () => {
    if (salarySortOrder === "none") {
      setSalarySortOrder("highest")
    } else if (salarySortOrder === "highest") {
      setSalarySortOrder("lowest")
    } else {
      setSalarySortOrder("none")
    }
  }

  const renderSalarySortIcon = () => {
    if (salarySortOrder === "highest") return <ArrowDown className="h-3 w-3" />
    if (salarySortOrder === "lowest") return <ArrowUp className="h-3 w-3" />
    return <ArrowUpDown className="h-3 w-3" />
  }

  return (
    <div className="rounded-md border dark:border-gray-700 bg-white dark:bg-gray-900">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-50">Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>
              <StatusFilterPopover value={statusFilter} onChange={setStatusFilter} />
            </TableHead>
            <TableHead>
              <button
                className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={handleSalarySortToggle}
              >
                <span>Salary</span>
                {renderSalarySortIcon()}
              </button>
            </TableHead>
            <TableHead>Applied Date</TableHead>
            <TableHead>Follow-up</TableHead>
            <TableHead className="w-12.5"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app, index) => (
            <TableRow
              key={app.id ?? `app-${index}`}
              onClick={() => onRowClick?.(app)}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <TableCell className="font-bold">
                <div className="flex items-center gap-2">
                  <FollowUpDot followUpDate={app.followUpDate} />
                  {app.company}
                </div>
              </TableCell>
              <TableCell>{app.role}</TableCell>
              <TableCell>
                <StatusPill variant={app.status ?? "applied"}>
                  {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : "Unknown"}
                </StatusPill>
              </TableCell>
              <TableCell>{formatSalary(app.salary, app.currency)}</TableCell>
              <TableCell>
                {(() => {
                  const date = new Date(app.appliedDate);
                  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                })()}
              </TableCell>
              <TableCell>
                {app.followUpDate ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-900 dark:text-white">
                      {(() => {
                        const date = new Date(app.followUpDate!);
                        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                      })()}
                    </span>
                    <FollowUpBadge followUpDate={app.followUpDate} className="mt-1" />
                  </div>
                ) : (
                  <FollowUpBadge followUpDate={app.followUpDate} className="mt-1" />
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu
                  onEdit={() => onEdit?.(app)}
                  onDelete={() => onDelete?.(app)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}