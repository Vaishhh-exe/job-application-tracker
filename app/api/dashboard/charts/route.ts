import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  console.log("[Charts API] Request received at:", new Date().toISOString())
  
  try {
    console.log("[Charts API] Attempting to get session...")
    const session = await auth()
    console.log("[Charts API] Session received:", session ? "yes" : "no", session?.user?.id ? `(userId: ${session.user.id})` : "(no user)")

    if (!session?.user?.id) {
      console.error("[Charts API] No authenticated user")
      return NextResponse.json(
        { error: "Unauthorized - user not authenticated" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Monthly trend data
    console.log("[Charts API] Fetching monthly trends for user:", userId)
    const now = new Date()
    const months: { month: string; count: number }[] = []
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
      
      const count = await prisma.application.count({
        where: {
          userId,
          appliedDate: {
            gte: date,
            lt: nextMonth,
          },
        },
      })
      
      months.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        count,
      })
    }

    console.log("[Charts API] Monthly trends fetched:", months.length, "months")

    // Status distribution
    console.log("[Charts API] Fetching status distribution...")
    const statuses = ["applied", "interview", "offer", "rejected", "ghosted"]
    const statusDistribution = await Promise.all(
      statuses.map(async (status) => {
        const count = await prisma.application.count({
          where: { userId, status },
        })
        return { status, count }
      })
    )

    console.log("[Charts API] Status distribution fetched:", statusDistribution)

    const response = { monthlyTrend: months, statusDistribution }
    console.log("[Charts API] Sending response:", JSON.stringify(response).substring(0, 100) + "...")
    
    return NextResponse.json(response)
  } catch (error) {
    console.error("[Charts API] Error occurred:", error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : ""
    
    console.error("[Charts API] Error stack:", stack)
    
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard charts",
        message: errorMsg,
      },
      { status: 500 }
    )
  }
}
