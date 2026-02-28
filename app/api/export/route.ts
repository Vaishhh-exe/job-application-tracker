import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      orderBy: { appliedDate: "desc" },
    })

    // CSV headers
    const headers = [
      "Company",
      "Role",
      "Status",
      "Applied Date",
      "Follow-up Date",
      "Priority",
      "Recruiter Name",
      "Job URL",
      "Salary",
      "Notes",
      "Tags"
    ]

    // Helper to escape CSV fields
    const escapeCSV = (value: string | null | undefined): string => {
      if (value === null || value === undefined) return ""
      const str = String(value)
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    // Build CSV rows
    const rows = applications.map(app => [
      escapeCSV(app.company),
      escapeCSV(app.role),
      escapeCSV(app.status),
      app.appliedDate ? new Date(app.appliedDate).toISOString().split("T")[0] : "",
      app.followUpDate ? new Date(app.followUpDate).toISOString().split("T")[0] : "",
      escapeCSV(app.priority),
      escapeCSV(app.recruiterName),
      escapeCSV(app.jobUrl),
      app.salary ? String(app.salary) : "",
      escapeCSV(app.notes),
      escapeCSV(app.tags.join("; "))
    ])

    // Combine headers and rows
    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n")

    // Return CSV with proper headers for download
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="applications-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export applications" }, { status: 500 })
  }
}
