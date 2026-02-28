'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useView } from '@/app/applications/layout'

export function Topbar() {
  const { 
    view, 
    setView, 
    setIsModalOpen,
    searchQuery,
    setSearchQuery,
  } = useView()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const handleExport = () => {
    window.location.href = '/api/export'
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Import failed')
      } else {
        alert(result.message)
        window.location.reload()
      }
    } catch (error) {
      alert('Failed to import CSV')
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-50 max-w-md">
          <Input
            type="search"
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-md border border-gray-300">
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setView("list")}
            >
              List
            </Button>
            <Button
              variant={view === "board" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none border-l"
              onClick={() => setView("board")}
            >
              Board
            </Button>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            + Add Application
          </Button>
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleImportClick} disabled={importing}>
            {importing ? 'Importing...' : 'Import CSV'}
          </Button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />
      </div>
    </header>
  )
}
