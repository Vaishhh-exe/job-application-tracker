import { NextResponse } from "next/server"
import { sendEmail, isEmailConfigured } from "@/lib/email"

// POST - Send a test email to verify configuration
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      )
    }

    // Check if email is configured
    if (!isEmailConfigured()) {
      return NextResponse.json({
        success: false,
        error: "Email not configured. Please update your .env file with:\n" +
          "SMTP_USER=your-actual-gmail@gmail.com\n" +
          "SMTP_PASS=your-16-character-app-password\n\n" +
          "To get an App Password for Gmail:\n" +
          "1. Go to https://myaccount.google.com/security\n" +
          "2. Enable 2-Step Verification\n" +
          "3. Go to https://myaccount.google.com/apppasswords\n" +
          "4. Generate a new App Password for 'Mail'",
      }, { status: 400 })
    }

    const result = await sendEmail({
      to: email,
      subject: "Test Email from Meridian",
      text: "If you received this email, your email configuration is working correctly!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4F46E5;">✅ Email Configuration Working!</h2>
          <p>If you received this email, your Job Tracker email configuration is set up correctly.</p>
          <p>You can now receive follow-up reminders for your job applications.</p>
        </div>
      `,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${email}. Check your inbox!`,
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 })
    }
  } catch (error) {
    console.error("POST /api/test-email error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

// GET - Check email configuration status
export async function GET() {
  return NextResponse.json({
    configured: isEmailConfigured(),
    smtp_host: process.env.SMTP_HOST || "smtp.gmail.com",
    smtp_port: process.env.SMTP_PORT || "587",
    smtp_user: process.env.SMTP_USER ? 
      (process.env.SMTP_USER === "your-email@gmail.com" ? "NOT CONFIGURED" : "configured") : 
      "NOT CONFIGURED",
    smtp_pass: process.env.SMTP_PASS ? 
      (process.env.SMTP_PASS === "your-app-password" ? "NOT CONFIGURED" : "configured") : 
      "NOT CONFIGURED",
  })
}
