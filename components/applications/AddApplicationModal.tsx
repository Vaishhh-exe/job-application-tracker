"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"

import { Application, ApplicationStatus, Priority } from "@/types/application"

interface AddApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  onAddApplication?: (app: Application) => void
  onUpdateApplication?: (app: Application) => void
  application?: Application | null
}

type ValidationErrors = Record<string, string[] | undefined>

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  return new Date().toISOString().split("T")[0]
}

// Helper to format date for input field
const formatDateForInput = (date: string | Date) => {
  if (!date) return getTodayDate()
  const d = typeof date === "string" ? new Date(date) : date
  return d.toISOString().split("T")[0]
}

export function AddApplicationModal({
  isOpen,
  onClose,
  onAddApplication,
  onUpdateApplication,
  application,
}: AddApplicationModalProps) {
  const isEditMode = !!application
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState<ApplicationStatus>("applied")
  const [appliedDate, setAppliedDate] = useState<string | null>(null)
  const [followUpDate, setFollowUpDate] = useState<string | null>(null)
  const [followUpTime, setFollowUpTime] = useState("09:00")
  const [notes, setNotes] = useState("")
  const [salary, setSalary] = useState("")
  const [priority, setPriority] = useState<Priority>("MEDIUM")
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Helper to extract time from a date string
  const formatTimeForInput = (date: string | Date) => {
    if (!date) return "09:00"
    const d = typeof date === "string" ? new Date(date) : date
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  // Reset form when modal opens or application changes
  useEffect(() => {
    if (isOpen) {
      setErrors({})
      setSubmitError(null)
      if (application) {
        // Edit mode: pre-fill with existing data
        setCompany(application.company || "")
        setRole(application.role || "")
        setStatus(application.status || "applied")
        setAppliedDate(application.appliedDate ? formatDateForInput(application.appliedDate) : null)
        setFollowUpDate(application.followUpDate ? formatDateForInput(application.followUpDate) : null)
        setFollowUpTime(application.followUpDate ? formatTimeForInput(application.followUpDate) : "09:00")
        setNotes(application.notes || "")
        setSalary(application.salary ? String(application.salary) : "")
        setPriority(application.priority || "MEDIUM")
      } else {
        // Create mode: reset to defaults
        setCompany("")
        setRole("")
        setStatus("applied")
        setAppliedDate(null)
        setFollowUpDate(null)
        setFollowUpTime("09:00")
        setNotes("")
        setSalary("")
        setPriority("MEDIUM")
      }
    }
  }, [isOpen, application])

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    
    if (!company.trim()) {
      newErrors.company = ["Company name is required"]
    } else if (company.length > 100) {
      newErrors.company = ["Company name must be less than 100 characters"]
    }
    
    if (!role.trim()) {
      newErrors.role = ["Role is required"]
    } else if (role.length > 100) {
      newErrors.role = ["Role must be less than 100 characters"]
    }
    
    if (!appliedDate) {
      newErrors.appliedDate = ["Applied date is required"]
    }
    
    if (notes && notes.length > 2000) {
      newErrors.notes = ["Notes must be less than 2000 characters"]
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormValid = company.trim() !== "" && role.trim() !== "" && appliedDate !== ""

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setSubmitError(null)

    // Combine date and time for followUpDate
    const getFollowUpDateTime = () => {
      if (!followUpDate) return null
      return `${followUpDate}T${followUpTime}:00`
    }

    try {
      if (isEditMode && application) {
        // Update existing application
        const res = await fetch(`/api/applications/${application.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company,
            role,
            status,
            appliedDate,
            followUpDate: getFollowUpDateTime(),
            notes,
            salary: salary ? parseInt(salary, 10) : null,
            priority,
          }),
        })

        if (!res.ok) {
          const errorData = await res.json()
          if (errorData.details && typeof errorData.details === "object") {
            setErrors(errorData.details)
          } else {
            setSubmitError(errorData.error || "Failed to update application")
          }
          return
        }

        const response = await res.json()
        onUpdateApplication?.(response.data || response)
      } else {
        // Create new application
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company,
            role,
            status,
            appliedDate,
            followUpDate: getFollowUpDateTime(),
            notes,
            salary: salary ? parseInt(salary, 10) : null,
            priority,
            tags: [],
          }),
        })

        if (!res.ok) {
          const errorData = await res.json()
          if (errorData.details && typeof errorData.details === "object") {
            setErrors(errorData.details)
          } else {
            setSubmitError(errorData.error || "Failed to create application")
          }
          return
        }

        const response = await res.json()
        onAddApplication?.(response.data || response)
      }

      onClose()
    } catch (error) {
      console.error("Submit error:", error)
      setSubmitError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-4 md:p-6">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Application" : "Add New Application"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the application details." : "Add a new job application to track your progress."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {submitError}
            </div>
          )}

          <div className="space-y-1">
            <Label>Company *</Label>
            <Input
              value={company}
              onChange={(e) => {
                setCompany(e.target.value)
                if (errors.company) setErrors({ ...errors, company: undefined })
              }}
              className={errors.company ? "border-red-500" : ""}
            />
            {errors.company ? (
              <p className="text-xs text-red-500">{errors.company[0]}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Required field</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Role *</Label>
            <Input
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
                if (errors.role) setErrors({ ...errors, role: undefined })
              }}
              className={errors.role ? "border-red-500" : ""}
            />
            {errors.role ? (
              <p className="text-xs text-red-500">{errors.role[0]}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Required field</p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Status *</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ApplicationStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="ghosted">Ghosted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Salary</Label>
              <Input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 75000"
              />
            </div>

            <div className="space-y-1">
              <Label>Applied Date *</Label>
              <DatePicker
                value={appliedDate || undefined}
                onChange={(date) => {
                  setAppliedDate(date ? date.toISOString().split("T")[0] : null)
                  if (errors.appliedDate) setErrors({ ...errors, appliedDate: undefined })
                }}
                placeholder="Select date"
                className={errors.appliedDate ? "[&>div]:border-red-500" : ""}
              />
              {errors.appliedDate && (
                <p className="text-xs text-red-500">{errors.appliedDate[0]}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Follow-up</Label>
              <DatePicker
                value={followUpDate || undefined}
                onChange={(date) => setFollowUpDate(date ? date.toISOString().split("T")[0] : null)}
                placeholder="Select date"
              />
            </div>

            <div className="space-y-1">
              <Label>Time</Label>
              <TimePicker
                value={followUpTime}
                onChange={(time) => setFollowUpTime(time)}
                placeholder="Select time"
                disabled={!followUpDate}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value)
                if (errors.notes) setErrors({ ...errors, notes: undefined })
              }}
              className={`w-full min-h-24 max-h-32 border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700 ${errors.notes ? "border-red-500" : ""}`}
            />
            {errors.notes && (
              <p className="text-xs text-red-500">{errors.notes[0]}</p>
            )}
            <p className="text-xs text-muted-foreground">{notes.length}/2000 characters</p>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {isEditMode ? "Updating..." : "Adding..."}
              </>
            ) : (
              isEditMode ? "Update Application" : "Add Application"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
