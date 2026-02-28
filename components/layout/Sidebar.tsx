import Link from "next/link";
import { Briefcase, Settings, LayoutDashboard, Home } from "lucide-react";
import { UserMenu } from "./UserMenu";

interface SidebarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
      <Link href="/" className="inline-block">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-6 hover:opacity-80 transition-opacity">Meridian</h2>
      </Link>

      <nav className="space-y-2 flex-1">
        <Link
          href="/"
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/dashboard"
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/applications"
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <Briefcase className="h-5 w-5" />
          <span>Applications</span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
      </nav>

      {user && <UserMenu user={user} />}
    </aside>
  );
}
