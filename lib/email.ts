import nodemailer from "nodemailer"

// Check if email is configured
export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS && 
    process.env.SMTP_USER !== "your-email@gmail.com" &&
    process.env.SMTP_PASS !== "your-app-password")
}

// Configure your email transporter
// For production, use a real SMTP service like SendGrid, AWS SES, etc.
function createTransporter() {
  if (!isEmailConfigured()) {
    console.warn("Email not configured. Set SMTP_USER and SMTP_PASS in .env")
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  const transporter = createTransporter()
  
  if (!transporter) {
    console.error("Email not configured. Please update SMTP settings in .env file.")
    return { 
      success: false, 
      error: "Email not configured. Please set SMTP_USER and SMTP_PASS in .env file with your Gmail address and App Password." 
    }
  }

  try {
    // Verify connection first
    await transporter.verify()
    console.log("SMTP connection verified successfully")

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `Meridian <${process.env.SMTP_USER}>`,

      to,
      subject,
      text,
      html: html || text,
    })
    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Failed to send email:", errorMessage)
    
    // Provide helpful error messages
    let userMessage = errorMessage
    if (errorMessage.includes("Invalid login")) {
      userMessage = "Invalid Gmail credentials. For Gmail, use an App Password (not your regular password). Go to https://myaccount.google.com/apppasswords"
    } else if (errorMessage.includes("ECONNREFUSED")) {
      userMessage = "Could not connect to email server. Check your SMTP_HOST and SMTP_PORT settings."
    } else if (errorMessage.includes("self signed certificate")) {
      userMessage = "SSL certificate error. Try setting SMTP_PORT to 587."
    }
    
    return { success: false, error: userMessage }
  }
}

export function createFollowUpReminderEmail(application: {
  company: string
  role: string
  followUpDate: Date
}) {
  const subject = `Follow-up Reminder: ${application.company} - ${application.role}`
  
  const text = `
Hi there!

This is a reminder to follow up on your job application:

Company: ${application.company}
Role: ${application.role}
Follow-up Date: ${application.followUpDate.toLocaleDateString()}

Don't forget to reach out and show your continued interest!

Best of luck,
Job Tracker
`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .highlight { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .label { font-weight: bold; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Follow-up Reminder</h1>
    </div>
    <div class="content">
      <p>Hi there!</p>
      <p>This is a reminder to follow up on your job application:</p>
      
      <div class="highlight">
        <p><span class="label">Company:</span> ${application.company}</p>
        <p><span class="label">Role:</span> ${application.role}</p>
        <p><span class="label">Follow-up Date:</span> ${application.followUpDate.toLocaleDateString()}</p>
      </div>
      
      <p>Don't forget to reach out and show your continued interest!</p>
      <p>Best of luck,<br>Meridian</p>
    </div>
  </div>
</body>
</html>
`

  return { subject, text, html }
}
