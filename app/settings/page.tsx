"use client"

import { useState, useEffect, useCallback } from "react"
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import Image from "next/image"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { User, Palette, Settings, Trash2, LogOut } from "lucide-react"

interface UserPreferences {
  name: string
  email: string
  image: string | null
  defaultStatus: string
  defaultPriority: string
  defaultCurrency: string
  dateFormat: string
  theme: string
}

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "INR", label: "INR (₹)" },
  { value: "CAD", label: "CAD (C$)" },
  { value: "AUD", label: "AUD (A$)" },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await fetch("/api/settings")
      if (res.ok) {
        const data = await res.json()
        setPreferences(data)
        // Sync theme with user preference
        if (data.theme) {
          setTheme(data.theme)
        }
      }
    } catch {
      console.error("Failed to fetch preferences")
    } finally {
      setLoading(false)
    }
  }, [setTheme])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const savePreferences = async (updates: Partial<UserPreferences>) => {
    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        const data = await res.json()
        setPreferences(data)
      }
    } catch {
      console.error("Failed to save preferences")
    } finally {
      setSaving(false)
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    savePreferences({ theme: newTheme })
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return

    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
      })

      if (res.ok) {
        signOut({ callbackUrl: "/" })
      } else {
        alert("Failed to delete account")
      }
    } catch {
      alert("Failed to delete account")
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
        {saving && (
          <span className="text-sm text-gray-500 dark:text-gray-400">Saving...</span>
        )}
      </div>

      {/* Profile Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold dark:text-white">Profile</h2>
        </div>

        <div className="space-y-4">
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            {preferences?.image ? (
              <Image
                src={preferences.image}
                alt="Profile"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Profile picture from Google account
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={preferences?.name || ""}
              onChange={(e) => setPreferences(prev => prev ? { ...prev, name: e.target.value } : null)}
              onBlur={(e) => savePreferences({ name: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={preferences?.email || ""}
              disabled
              className="bg-gray-50 dark:bg-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Email is managed by your Google account
            </p>
          </div>

          {/* Logout Button */}
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 pt-6 border-t dark:border-gray-700">
          <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">
            Danger Zone
          </h3>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            This will permanently delete your account and all your applications.
          </p>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold dark:text-white">Appearance</h2>
        </div>

        <div className="space-y-6">
          {/* Theme */}
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="flex gap-2">
              {[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "system", label: "System" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    theme === option.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Default Preferences Section */}
      <section className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold dark:text-white">Default Preferences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Default Status */}
          <div className="space-y-2">
            <Label>Default Status</Label>
            <Select
              value={preferences?.defaultStatus || "applied"}
              onValueChange={(v) => savePreferences({ defaultStatus: v })}
            >
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

          {/* Default Priority */}
          <div className="space-y-2">
            <Label>Default Priority</Label>
            <Select
              value={preferences?.defaultPriority || "MEDIUM"}
              onValueChange={(v) => savePreferences({ defaultPriority: v })}
            >
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

          {/* Default Currency */}
          <div className="space-y-2">
            <Label>Default Currency</Label>
            <Select
              value={preferences?.defaultCurrency || "USD"}
              onValueChange={(v) => savePreferences({ defaultCurrency: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-2">
            <Label>Date Format</Label>
            <Select
              value={preferences?.dateFormat || "DD/MM/YYYY"}
              onValueChange={(v) => savePreferences({ dateFormat: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account
              and all your job applications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE"}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
