"use client"

import { ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { Sidebar } from './Sidebar'

// Disable SSR for Topbar to prevent Radix UI aria-controls ID mismatch hydration errors
const Topbar = dynamic(
  () => import('./Topbar').then((m) => ({ default: m.Topbar })),
  {
    ssr: false,
    loading: () => (
      <div className="h-18 shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700" />
    ),
  }
)

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { data: session } = useSession()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar user={session?.user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}