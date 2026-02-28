import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get current month's start date
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch all counts in parallel for the authenticated user
    const [
      totalApplications,
      totalOffers,
      totalRejected,
      totalInterviews,
      applicationsThisMonth,
      allApplications,
    ] = await Promise.all([
      prisma.application.count({ where: { userId } }),
      prisma.application.count({ where: { userId, status: "offer" } }),
      prisma.application.count({ where: { userId, status: "rejected" } }),
      prisma.application.count({ where: { userId, status: "interview" } }),
      prisma.application.count({
        where: {
          userId,
          appliedDate: {
            gte: startOfMonth,
          },
        },
      }),
      prisma.application.findMany({
        where: { userId },
        select: {
          appliedDate: true,
          status: true,
        },
      }),
    ])

    // Calculate rates (avoid division by zero)
    const offerRate = totalApplications > 0 
      ? ((totalOffers / totalApplications) * 100).toFixed(1) 
      : "0.0"
    const interviewRate = totalApplications > 0 
      ? ((totalInterviews / totalApplications) * 100).toFixed(1) 
      : "0.0"
    const rejectionRate = totalApplications > 0 
      ? ((totalRejected / totalApplications) * 100).toFixed(1) 
      : "0.0"

    // Calculate monthly trend (last 12 months)
    const monthlyTrend = calculateMonthlyTrend(allApplications)

    // Calculate status distribution
    const statusDistribution = calculateStatusDistribution(allApplications)

    return NextResponse.json({
      totalApplications,
      totalOffers,
      totalRejected,
      totalInterviews,
      applicationsThisMonth,
      offerRate,
      interviewRate,
      rejectionRate,
      monthlyTrend,
      statusDistribution,
    })
  } catch (error) {
    console.error("GET /api/dashboard error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}

function calculateMonthlyTrend(applications: Array<{ appliedDate: Date }>) {
  const now = new Date()
  const monthlyData = new Map<string, number>()

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    monthlyData.set(key, 0)
  }

  // Count applications by month
  applications.forEach((app) => {
    const date = new Date(app.appliedDate)
    const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    if (monthlyData.has(key)) {
      monthlyData.set(key, (monthlyData.get(key) || 0) + 1)
    }
  })

  return Array.from(monthlyData, ([month, count]) => ({ month, count }))
}

function calculateStatusDistribution(applications: Array<{ status: string }>) {
  const statusCounts = {
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    ghosted: 0,
  }

  applications.forEach((app) => {
    if (app.status in statusCounts) {
      statusCounts[app.status as keyof typeof statusCounts]++
    }
  })

  return Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }))
}
