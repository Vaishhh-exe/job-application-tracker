'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { AppShell } from "@/components/layout/AppShell";

type View = "list" | "board"

type SortOrder = "newest" | "oldest"
type SalarySortOrder = "none" | "highest" | "lowest"

const ViewContext = createContext<{
  view: View
  setView: (v: View) => void
  isModalOpen: boolean
  setIsModalOpen: (b: boolean) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  statusFilter: string
  setStatusFilter: (s: string) => void
  sortOrder: SortOrder
  setSortOrder: (o: SortOrder) => void
  salarySortOrder: SalarySortOrder
  setSalarySortOrder: (o: SalarySortOrder) => void
} | null>(null)

export function useView() {
  const ctx = useContext(ViewContext)
  if (!ctx) throw new Error('useView must be used within ApplicationsLayout')
  return ctx
}

export default function ApplicationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [view, setView] = useState<View>("list")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  const [salarySortOrder, setSalarySortOrder] = useState<SalarySortOrder>("none")

  return (
    <ViewContext.Provider value={{
      view, 
      setView, 
      isModalOpen, 
      setIsModalOpen,
      searchQuery,
      setSearchQuery,
      statusFilter,
      setStatusFilter,
      sortOrder,
      setSortOrder,
      salarySortOrder,
      setSalarySortOrder,
    }}>
      <AppShell>{children}</AppShell>
    </ViewContext.Provider>
  )
}
