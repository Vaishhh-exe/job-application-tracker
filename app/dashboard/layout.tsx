'use client'

import { ReactNode } from 'react'
import { Briefcase, Settings, LayoutDashboard } from 'lucide-react'

function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
      <nav className="space-y-2">
        <a href="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </a>
        <a href="/applications" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
          <Briefcase className="h-5 w-5" />
          <span>Applications</span>
        </a>
        <a href="/settings" className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </a>
      </nav>
    </aside>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h1 className="text-xl font-semibold dark:text-white">Dashboard</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
