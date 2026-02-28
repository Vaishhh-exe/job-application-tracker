import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, createFollowUpReminderEmail, isEmailConfigured } from "@/lib/email"

// This endpoint can be called by:
// 1. Vercel Cron (automatic, configured in vercel.json)
// 2. External cron services (cron-job.org, etc.)
// 3. Manual testing

// GET - Check and send reminders for applications due at the current time
export async function GET(req: Request) {
  // Optional: Verify cron secret for security
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 500 }
    )
  }

  try {
    const now = new Date()
    
    // Find applications where:
    // 1. followUpDate has passed (or is now)
    // 2. reminder hasn't been sent yet
    // 3. status is not rejected or offer
    const applications = await prisma.application.findMany({
      where: {
        followUpDate: {
          lte: now,
        },
        reminderSentAt: null,
        status: {
          notIn: ["rejected", "offer"],
        },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (applications.length === 0) {
      return NextResponse.json({
        message: "No reminders to send",
        checked: now.toISOString(),
        sent: 0,
      })
    }

    const results = []
    
    for (const app of applications) {
      if (!app.user?.email || !app.followUpDate) continue
      
      const emailContent = createFollowUpReminderEmail({
        company: app.company,
        role: app.role,
        followUpDate: app.followUpDate,
      })

      const result = await sendEmail({
        to: app.user.email,
        ...emailContent,
      })

      if (result.success) {
        // Mark as reminded to avoid duplicate emails
        await prisma.application.update({
          where: { id: app.id },
          data: { reminderSentAt: now },
        })
      }

      results.push({
        applicationId: app.id,
        company: app.company,
        userEmail: app.user.email,
        success: result.success,
        error: result.error,
      })
    }

    const successCount = results.filter((r) => r.success).length

    return NextResponse.json({
      message: `Processed ${applications.length} reminders, sent ${successCount}`,
      checked: now.toISOString(),
      sent: successCount,
      total: applications.length,
      results,
    })
  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json(
      { error: "Failed to process reminders" },
      { status: 500 }
    )
  }
}
