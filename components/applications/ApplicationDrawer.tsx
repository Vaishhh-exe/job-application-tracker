"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, ExternalLink, Briefcase } from "lucide-react"
import { Application, ApplicationStatus, Priority } from "@/types/application"
import { DatePicker } from "@/components/ui/date-picker"
import { StatusPill } from "@/components/StatusPill"
import {
  FieldRow,
  InlineTextField,
  InlineNumberField,
  InlineSelectField,
  InlineTextareaField,
  InlineTagsField,
  SaveIndicator,
  type SaveStatus,
} from "./InlineFields"

interface ApplicationDrawerProps {
  application: Application | null
  isOpen: boolean
  onClose: () => void
  onApplicationUpdate: (app: Application) => void
}

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "ghosted", label: "Ghosted" },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
]

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  LOW: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
}

const CURRENCY_OPTIONS: { value: string; label: string }[] = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "INR", label: "INR (₹)" },
  { value: "CAD", label: "CAD (C$)" },
  { value: "AUD", label: "AUD (A$)" },
]

export function ApplicationDrawer({
  application,
  isOpen,
  onClose,
  onApplicationUpdate,
}: ApplicationDrawerProps) {
  const [visible, setVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [fieldStatuses, setFieldStatuses] = useState<Record<string, SaveStatus>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const panelRef = useRef<HTMLDivElement>(null)

  // Animation lifecycle: mount → visible → (close) → invisible → unmount
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      // Double rAF to ensure DOM is painted before adding transition class
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
    } else {
      setVisible(false)
    }
  }, [isOpen])

  // Reset field statuses when the drawer opens with a new application
  useEffect(() => {
    if (isOpen) {
      setFieldStatuses({})
      setFieldErrors({})
    }
  }, [isOpen, application?.id])

  // Unmount after exit animation
  const handleTransitionEnd = () => {
    if (!visible && !isOpen) {
      setShouldRender(false)
    }
  }

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, onClose])

  // Save a single field to the API
  const saveField = useCallback(
    async (field: string, value: unknown) => {
      if (!application) return

      setFieldStatuses((prev) => ({ ...prev, [field]: "saving" }))
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })

      try {
        const res = await fetch(`/api/applications/${application.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [field]: value }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: "Save failed" }))
          throw new Error(data.error || "Save failed")
        }

        const response = await res.json()
        const updated = response.data || response
        onApplicationUpdate(updated)
        setFieldStatuses((prev) => ({ ...prev, [field]: "saved" }))
        setTimeout(
          () => setFieldStatuses((prev) => ({ ...prev, [field]: "idle" })),
          2000
        )
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Save failed"
        setFieldStatuses((prev) => ({ ...prev, [field]: "error" }))
        setFieldErrors((prev) => ({ ...prev, [field]: message }))
        setTimeout(() => {
          setFieldStatuses((prev) => ({ ...prev, [field]: "idle" }))
          setFieldErrors((prev) => {
            const next = { ...prev }
            delete next[field]
            return next
          })
        }, 3000)
      }
    },
    [application, onApplicationUpdate]
  )

  if (!shouldRender || !application) return null

  return (
    <div
      className="fixed inset-0 z-50"
      onTransitionEnd={handleTransitionEnd}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        ref={panelRef}
        className={`absolute right-0 top-0 h-full w-full max-w-120 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b dark:border-gray-700 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {application.company}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {application.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="px-6 py-1.5 border-b dark:border-gray-700 shrink-0">
          <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">
            All changes are saved automatically
          </p>
        </div>

        {/* ── Scrollable Content ─────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Basic Information */}
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
              Basic Information
            </h3>
            <div className="rounded-lg border dark:border-gray-700 p-3 space-y-0.5">
              <FieldRow
                label="Company"
                status={fieldStatuses.company}
                error={fieldErrors.company}
              >
                <InlineTextField
                  value={application.company}
                  onSave={(v: string) => saveField("company", v)}
                  placeholder="Company name"
                />
              </FieldRow>

              <FieldRow
                label="Role"
                status={fieldStatuses.role}
                error={fieldErrors.role}
              >
                <InlineTextField
                  value={application.role}
                  onSave={(v: string) => saveField("role", v)}
                  placeholder="Job title"
                />
              </FieldRow>

              <FieldRow
                label="Status"
                status={fieldStatuses.status}
                error={fieldErrors.status}
              >
                <InlineSelectField<ApplicationStatus>
                  value={application.status}
                  options={STATUS_OPTIONS}
                  onSave={(v: ApplicationStatus) => saveField("status", v)}
                  renderValue={(v: ApplicationStatus) => (
                    <StatusPill variant={v}>
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </StatusPill>
                  )}
                />
              </FieldRow>

              <FieldRow
                label="Priority"
                status={fieldStatuses.priority}
                error={fieldErrors.priority}
              >
                <InlineSelectField<Priority>
                  value={application.priority}
                  options={PRIORITY_OPTIONS}
                  onSave={(v: Priority) => saveField("priority", v)}
                  renderValue={(v: Priority) => (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        PRIORITY_COLORS[v] || ""
                      }`}
                    >
                      {v}
                    </span>
                  )}
                />
              </FieldRow>

              <FieldRow
                label="Applied"
                status={fieldStatuses.appliedDate}
                error={fieldErrors.appliedDate}
              >
                <DatePicker
                  value={application.appliedDate || undefined}
                  onChange={(date: Date) =>
                    saveField("appliedDate", date.toISOString().split("T")[0])
                  }
                  placeholder="Select applied date"
                />
              </FieldRow>

              <FieldRow
                label="Follow-up"
                status={fieldStatuses.followUpDate}
                error={fieldErrors.followUpDate}
              >
                <DatePicker
                  value={application.followUpDate || undefined}
                  onChange={(date: Date) =>
                    saveField("followUpDate", date.toISOString().split("T")[0])
                  }
                  placeholder="Select follow-up date"
                />
              </FieldRow>
            </div>
          </section>

          {/* Compensation */}
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
              Compensation
            </h3>
            <div className="rounded-lg border dark:border-gray-700 p-3 space-y-0.5">
              <FieldRow
                label="Salary"
                status={fieldStatuses.salary}
                error={fieldErrors.salary}
              >
                <InlineNumberField
                  value={application.salary}
                  onSave={(v: number | null) => saveField("salary", v)}
                  placeholder="Annual salary"
                />
              </FieldRow>

              <FieldRow
                label="Currency"
                status={fieldStatuses.currency}
                error={fieldErrors.currency}
              >
                <InlineSelectField<string>
                  value={application.currency || "USD"}
                  options={CURRENCY_OPTIONS}
                  onSave={(v: string) => saveField("currency", v)}
                />
              </FieldRow>
            </div>
          </section>

          {/* Details */}
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
              Details
            </h3>
            <div className="rounded-lg border dark:border-gray-700 p-3 space-y-0.5">
              <FieldRow
                label="Recruiter"
                status={fieldStatuses.recruiterName}
                error={fieldErrors.recruiterName}
              >
                <InlineTextField
                  value={application.recruiterName || ""}
                  onSave={(v: string) => saveField("recruiterName", v || null)}
                  placeholder="Recruiter name"
                />
              </FieldRow>

              <FieldRow
                label="Job URL"
                status={fieldStatuses.jobUrl}
                error={fieldErrors.jobUrl}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <InlineTextField
                      value={application.jobUrl || ""}
                      onSave={(v: string) => saveField("jobUrl", v || null)}
                      placeholder="https://..."
                      type="url"
                    />
                  </div>
                  {application.jobUrl && (
                    <a
                      href={application.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-md p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      title="Open link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </FieldRow>

              <FieldRow
                label="Tags"
                status={fieldStatuses.tags}
                error={fieldErrors.tags}
              >
                <InlineTagsField
                  value={application.tags || []}
                  onSave={(v: string[]) => saveField("tags", v)}
                  placeholder="Add tags (comma separated)"
                />
              </FieldRow>
            </div>
          </section>

          {/* Notes */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Notes
              </h3>
              <SaveIndicator
                status={fieldStatuses.notes || "idle"}
                error={fieldErrors.notes}
              />
            </div>
            <div className="rounded-lg border dark:border-gray-700">
              <InlineTextareaField
                value={application.notes || ""}
                onSave={(v: string) => saveField("notes", v || null)}
                placeholder="Click to add notes..."
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
