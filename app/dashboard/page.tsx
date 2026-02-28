"use client"

import { useEffect, useState } from "react"
import { DashboardCharts } from "@/components/dashboard/DashboardCharts"

interface DashboardStats {
  totalApplications: number
  totalOffers: number
  totalRejected: number
  totalInterviews: number
  applicationsThisMonth: number
  offerRate: string
  interviewRate: string
  rejectionRate: string
  monthlyTrend: { month: string; count: number }[]
  statusDistribution: { status: string; count: number }[]
}

function StatCard({
  title,
  value,
  subtitle,
  color = "blue",
}: {
  title: string
  value: string | number
  subtitle?: string
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "gray"
}) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300",
    green: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300",
    red: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300",
    yellow: "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300",
    purple: "bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300",
    gray: "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300",
  }

  return (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {subtitle && <p className="mt-1 text-sm opacity-70">{subtitle}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stats")
        return res.json()
      })
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-2">
        <p className="text-red-500">Error: {error}</p>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="p-2">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Applications"
          value={stats.totalApplications}
          color="blue"
        />
        <StatCard
          title="Total Offers"
          value={stats.totalOffers}
          color="green"
        />
        <StatCard
          title="Total Interviews"
          value={stats.totalInterviews}
          color="yellow"
        />
        <StatCard
          title="Total Rejected"
          value={stats.totalRejected}
          color="red"
        />
      </div>

      {/* Monthly Stats */}
      <h2 className="text-xl font-semibold mb-4 dark:text-white">This Month</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Applications This Month"
          value={stats.applicationsThisMonth}
          color="purple"
        />
      </div>

      {/* Rates */}
      <h2 className="text-xl font-semibold mb-4 dark:text-white">Success Rates</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Offer Rate"
          value={`${stats.offerRate}%`}
          subtitle="Offers / Total Applications"
          color="green"
        />
        <StatCard
          title="Interview Rate"
          value={`${stats.interviewRate}%`}
          subtitle="Interviews / Total Applications"
          color="yellow"
        />
        <StatCard
          title="Rejection Rate"
          value={`${stats.rejectionRate}%`}
          subtitle="Rejected / Total Applications"
          color="red"
        />
      </div>

      {/* Charts */}
      {stats.monthlyTrend?.length > 0 && stats.statusDistribution?.length > 0 && (
        <DashboardCharts 
          monthlyTrend={stats.monthlyTrend}
          statusDistribution={stats.statusDistribution}
        />
      )}
    </div>
  )
}
