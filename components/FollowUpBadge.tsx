"use client"

import { cn } from "@/lib/utils"

interface FollowUpBadgeProps {
  followUpDate?: string | Date | null
  className?: string
  showDot?: boolean
}

export function getFollowUpStatus(followUpDate?: string | Date | null): "today" | "overdue" | "upcoming" | null {
  if (!followUpDate) return null
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const followUp = new Date(followUpDate)
  followUp.setHours(0, 0, 0, 0)
  
  const diffTime = followUp.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "today"
  if (diffDays < 0) return "overdue"
  return "upcoming"
}

export function FollowUpBadge({ followUpDate, className, showDot = false }: FollowUpBadgeProps) {
  const status = getFollowUpStatus(followUpDate)
  
  if (!status || status === "upcoming") return null
  
  if (showDot) {
    return (
      <span
        className={cn(
          "inline-block w-2 h-2 rounded-full",
          status === "today" && "bg-yellow-500",
          status === "overdue" && "bg-red-500",
          className
        )}
        title={status === "today" ? "Follow up today" : "Overdue follow-up"}
      />
    )
  }
  
  return (
    <span
      className={cn(
        "inline-block w-fit px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap",
        status === "today" && "bg-yellow-100 text-yellow-800",
        status === "overdue" && "bg-red-100 text-red-800",
        className
      )}
    >
      {status === "today" ? "Follow Up Today" : "Overdue"}
    </span>
  )
}

export function FollowUpDot({ followUpDate, className }: FollowUpBadgeProps) {
  return <FollowUpBadge followUpDate={followUpDate} className={className} showDot />
}
