import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Priority } from "@prisma/client"

interface ParsedApplication {
  company: string
  role: string
  status: string
  appliedDate: Date
  followUpDate?: Date | null
  priority: Priority
  recruiterName?: string | null
  jobUrl?: string | null
  salary?: number | null
  notes?: string | null
  tags: string[]
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

function parsePriority(priorityStr: string): Priority {
  const upper = priorityStr?.toUpperCase()
  if (upper === "HIGH" || upper === "MEDIUM" || upper === "LOW") {
    return upper as Priority
  }
  return "MEDIUM" // Default
}

function parseStatus(statusStr: string): string {
  const lower = statusStr?.toLowerCase()
  const validStatuses = ["applied", "interview", "offer", "rejected", "ghosted"]
  return validStatuses.includes(lower) ? lower : "applied"
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV" }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split(/\r?\n/).filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have a header row and at least one data row" }, { status: 400 })
    }

    // Parse header to find column indices
    const headerLine = lines[0]
    const headers = parseCSVLine(headerLine).map(h => h.toLowerCase())
    
    const columnMap: Record<string, number> = {}
    const expectedColumns = [
      "company", "role", "status", "applied date", "follow-up date",
      "priority", "recruiter name", "job url", "salary", "notes", "tags"
    ]
    
    expectedColumns.forEach(col => {
      const index = headers.findIndex(h => h.includes(col.replace("-", "")))
      if (index !== -1) columnMap[col] = index
    })

    // Require at least company and role
    if (columnMap["company"] === undefined || columnMap["role"] === undefined) {
      return NextResponse.json({ 
        error: "CSV must have at least 'Company' and 'Role' columns" 
      }, { status: 400 })
    }

    const applications: ParsedApplication[] = []
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const values = parseCSVLine(line)
      
      const company = values[columnMap["company"]] || ""
      const role = values[columnMap["role"]] || ""

      if (!company || !role) {
        errors.push(`Row ${i + 1}: Missing company or role`)
        continue
      }

      const appliedDateStr = columnMap["applied date"] !== undefined 
        ? values[columnMap["applied date"]] 
        : ""
      const appliedDate = parseDate(appliedDateStr) || new Date()

      const followUpDateStr = columnMap["follow-up date"] !== undefined 
        ? values[columnMap["follow-up date"]] 
        : ""
      const followUpDate = parseDate(followUpDateStr)

      const priorityStr = columnMap["priority"] !== undefined 
        ? values[columnMap["priority"]] 
        : ""
      const priority = parsePriority(priorityStr)

      const statusStr = columnMap["status"] !== undefined 
        ? values[columnMap["status"]] 
        : ""
      const status = parseStatus(statusStr)

      const recruiterName = columnMap["recruiter name"] !== undefined 
        ? values[columnMap["recruiter name"]] || null 
        : null

      const jobUrl = columnMap["job url"] !== undefined 
        ? values[columnMap["job url"]] || null 
        : null

      const salaryStr = columnMap["salary"] !== undefined 
        ? values[columnMap["salary"]] 
        : ""
      const salary = salaryStr ? parseInt(salaryStr, 10) || null : null

      const notes = columnMap["notes"] !== undefined 
        ? values[columnMap["notes"]] || null 
        : null

      const tagsStr = columnMap["tags"] !== undefined 
        ? values[columnMap["tags"]] 
        : ""
      const tags = tagsStr 
        ? tagsStr.split(/[;,]/).map(t => t.trim()).filter(Boolean) 
        : []

      applications.push({
        company,
        role,
        status,
        appliedDate,
        followUpDate,
        priority,
        recruiterName,
        jobUrl,
        salary,
        notes,
        tags,
      })
    }

    if (applications.length === 0) {
      return NextResponse.json({ 
        error: "No valid applications found in CSV",
        details: errors 
      }, { status: 400 })
    }

    // Insert all applications
    const created = await prisma.application.createMany({
      data: applications.map(app => ({
        ...app,
        userId: session.user!.id!,
      })),
    })

    return NextResponse.json({ 
      message: `Successfully imported ${created.count} applications`,
      imported: created.count,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ error: "Failed to import applications" }, { status: 500 })
  }
}
