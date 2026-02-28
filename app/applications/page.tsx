"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { ApplicationsTable } from "@/components/applications/ApplicationsTable"
import { ApplicationsBoard } from "@/components/applications/ApplicationsBoard"
import { AddApplicationModal } from "@/components/applications/AddApplicationModal"
import { ApplicationDrawer } from "@/components/applications/ApplicationDrawer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Application } from "@/types/application"
import { useView } from "./layout"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const { 
    view, 
    isModalOpen, 
    setIsModalOpen,
    searchQuery,
    statusFilter,
    sortOrder,
    salarySortOrder,
  } = useView()
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [deleteApplication, setDeleteApplication] = useState<Application | null>(null)
  const [drawerApplication, setDrawerApplication] = useState<Application | null>(null)

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then((response) => {
        // Handle both old format (array) and new format ({ data, meta })
        const apps = response.data || response
        setApplications(Array.isArray(apps) ? apps : [])
      })
      .catch(console.error)
  }, [])

  const handleAddApplication = (newApp: Application) => {
    // Optimistic update for create
    setApplications((prev) => [newApp, ...prev])
  }

  const handleUpdateApplication = (updatedApp: Application) => {
    // Optimistic update for edit
    setApplications((prev) =>
      prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    )
  }

  const handleStatusChange = async (appId: string, newStatus: string, oldStatus: string) => {
    // Find the application being moved
    const appToUpdate = applications.find((app) => app.id === appId)
    if (!appToUpdate) return

    // Optimistic update - move to new status immediately
    const optimisticApp: Application = {
      ...appToUpdate,
      status: newStatus as Application["status"],
    }
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? optimisticApp : app))
    )

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!res.ok) {
        // Revert on error
        setApplications((prev) =>
          prev.map((app) => (app.id === appId ? appToUpdate : app))
        )
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        console.error("Failed to update application status:", errorData)
        alert(`Failed to update status: ${errorData.error || "Unknown error"}`)
        return
      }

      // Update with server response to ensure consistency
      const response = await res.json()
      const updatedApp = response.data || response
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? updatedApp : app))
      )
    } catch (error) {
      // Revert on network error
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? appToUpdate : app))
      )
      console.error("Failed to update application status:", error)
      alert("Failed to update status. Please try again.")
    }
  }

  const handleOpenDrawer = useCallback((app: Application) => {
    setDrawerApplication(app)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setDrawerApplication(null)
  }, [])

  const handleDrawerUpdate = useCallback((updatedApp: Application) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    )
    // Keep drawer in sync with latest data
    setDrawerApplication(updatedApp)
  }, [])

  const handleEdit = (app: Application) => {
    // Open drawer instead of modal for editing
    handleOpenDrawer(app)
  }

  const handleDelete = (app: Application) => {
    setDeleteApplication(app)
  }

  const confirmDelete = async () => {
    if (!deleteApplication) return

    // Optimistic update - remove from UI immediately
    const appToDelete = deleteApplication
    setApplications((prev) => prev.filter((app) => app.id !== appToDelete.id))
    setDeleteApplication(null)

    try {
      const res = await fetch(`/api/applications/${appToDelete.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        // Revert on error
        setApplications((prev) => [...prev, appToDelete])
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        console.error("Failed to delete application:", errorData)
        alert(`Failed to delete application: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      // Revert on network error
      setApplications((prev) => [...prev, appToDelete])
      console.error("Failed to delete application:", error)
      alert("Failed to delete application. Please try again.")
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingApplication(null)
  }

  // Filter and sort applications with useMemo for performance
  const filteredApplications = useMemo(() => {
    let filtered = [...applications]

    // Search filter (company or role)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (app) =>
          app.company.toLowerCase().includes(query) ||
          app.role.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter) {
      if (statusFilter === "needs-followup") {
        // Filter for applications that need follow-up (today or overdue)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        filtered = filtered.filter((app) => {
          if (!app.followUpDate) return false
          const followUp = new Date(app.followUpDate)
          followUp.setHours(0, 0, 0, 0)
          return followUp.getTime() <= today.getTime()
        })
      } else {
        filtered = filtered.filter((app) => app.status === statusFilter)
      }
    }

    // Sort by salary if salary sort is active
    if (salarySortOrder !== "none") {
      filtered.sort((a, b) => {
        const salaryA = a.salary ?? 0
        const salaryB = b.salary ?? 0
        return salarySortOrder === "highest" ? salaryB - salaryA : salaryA - salaryB
      })
    } else {
      // Sort by applied date
      filtered.sort((a, b) => {
        const dateA = new Date(a.appliedDate).getTime()
        const dateB = new Date(b.appliedDate).getTime()
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB
      })
    }

    return filtered
  }, [applications, searchQuery, statusFilter, sortOrder, salarySortOrder])

  return (
    <>
      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onAddApplication={handleAddApplication}
        onUpdateApplication={handleUpdateApplication}
        application={editingApplication}
      />

      <Dialog open={!!deleteApplication} onOpenChange={(open) => !open && setDeleteApplication(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the application for{" "}
              <strong>{deleteApplication?.company}</strong> - {deleteApplication?.role}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteApplication(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view === "list" ? (
        <ApplicationsTable 
          applications={filteredApplications}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRowClick={handleOpenDrawer}
        />
      ) : (
        <ApplicationsBoard 
          applications={filteredApplications}
          onStatusChange={handleStatusChange}
          onEdit={handleOpenDrawer}
        />
      )}

      <ApplicationDrawer
        application={drawerApplication}
        isOpen={!!drawerApplication}
        onClose={handleCloseDrawer}
        onApplicationUpdate={handleDrawerUpdate}
      />
    </>
  )
}
