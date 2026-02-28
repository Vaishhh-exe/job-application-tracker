import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, createFollowUpReminderEmail } from "@/lib/email"
import { auth } from "@/lib/auth"
import type { Application } from "@prisma/client"

// GET - Fetch applications needing follow-up for the authenticated user
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find all applications with follow-up date today or overdue for this user
    const applicationsNeedingFollowUp = await prisma.application.findMany({
      where: {
        userId: session.user.id,
        followUpDate: {
          lte: today,
        },
        // Only active applications (not rejected or with offers)
        status: {
          notIn: ["rejected", "offer"],
        },
      },
      orderBy: {
        followUpDate: "asc",
      },
    })

    return NextResponse.json({
      count: applicationsNeedingFollowUp.length,
      applications: applicationsNeedingFollowUp,
    })
  } catch (error) {
    console.error("GET /api/reminders error:", error)
    return NextResponse.json(
      { error: "Failed to fetch reminders" },
      { status: 500 }
    )
  }
}

// POST - Send follow-up reminder emails to authenticated user
export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - must be logged in with email" },
        { status: 401 }
      )
    }

    const userEmail = session.user.email
    const body = await req.json()
    const { applicationId } = body

    let applications: Application[] = []

    if (applicationId) {
      // Send reminder for specific application (must belong to user)
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
      })
      if (application && application.userId === session.user.id) {
        applications = [application]
      }
    } else {
      // Send reminders for all applications needing follow-up for this user
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      applications = await prisma.application.findMany({
        where: {
          userId: session.user.id,
          followUpDate: {
            lte: today,
          },
          status: {
            notIn: ["rejected", "offer"],
          },
        },
      })
    }

    if (applications.length === 0) {
      return NextResponse.json({
        message: "No applications need follow-up reminders",
        sent: 0,
      })
    }

    // Send emails to the authenticated user's email
    const results = []
    for (const app of applications) {
      if (!app.followUpDate) continue
      
      const emailContent = createFollowUpReminderEmail({
        company: app.company,
        role: app.role,
        followUpDate: app.followUpDate,
      })

      const result = await sendEmail({
        to: userEmail,
        ...emailContent,
      })

      results.push({
        applicationId: app.id,
        company: app.company,
        success: result.success,
        error: result.error,
      })
    }

    const successCount = results.filter((r) => r.success).length

    return NextResponse.json({
      message: `Sent ${successCount} reminder(s) to ${userEmail}`,
      sent: successCount,
      total: applications.length,
      results,
    })
  } catch (error) {
    console.error("POST /api/reminders error:", error)
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    )
  }
}
