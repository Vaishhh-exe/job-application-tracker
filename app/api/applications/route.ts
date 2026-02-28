import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { CreateApplicationSchema, GetApplicationsQuerySchema } from "@/lib/validations"
import { handleApiError, getPaginationMeta, AppError } from "@/lib/api-utils"

// Priority sort order mapping
const priorityOrder = { HIGH: 1, MEDIUM: 2, LOW: 3 }

// GET all applications for the authenticated user with pagination and sorting
export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED")
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const queryParams = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    }

    // Validate query parameters
    const { page, limit, sortBy, sortOrder, status, search } = GetApplicationsQuerySchema.parse(queryParams)

    // Build where clause
    const where: any = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { company: { contains: search, mode: "insensitive" } },
        { role: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get total count for pagination
    const total = await prisma.application.count({ where })

    // Build orderBy clause
    let orderBy: any = {}
    if (sortBy === "priority") {
      // For priority, we need to sort manually since it's an enum
      orderBy = { priority: sortOrder }
    } else {
      orderBy = { [sortBy]: sortOrder }
    }

    // Fetch applications with pagination
    const skip = (page - 1) * limit
    const applications = await prisma.application.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    })

    // For priority sorting, we need custom sort since Prisma doesn't handle enum ordering well
    if (sortBy === "priority") {
      applications.sort((a, b) => {
        const orderA = priorityOrder[a.priority as keyof typeof priorityOrder] || 999
        const orderB = priorityOrder[b.priority as keyof typeof priorityOrder] || 999
        return sortOrder === "asc" ? orderA - orderB : orderB - orderA
      })
    }

    return NextResponse.json({
      data: applications,
      meta: getPaginationMeta(page, limit, total),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// CREATE a new application
export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED")
    }

    const body = await req.json()
    
    // Validate request body
    const validatedData = CreateApplicationSchema.parse(body)

    // Ensure user row exists in DB (handles first-login / DB migration cases)
    await prisma.user.upsert({
      where: { id: session.user.id },
      update: {},
      create: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      },
    })

    // Transform jobUrl empty string to null
    const jobUrl = validatedData.jobUrl === "" ? null : validatedData.jobUrl

    const application = await prisma.application.create({
      data: {
        company: validatedData.company,
        role: validatedData.role,
        status: validatedData.status,
        appliedDate: new Date(validatedData.appliedDate),
        notes: validatedData.notes ?? null,
        recruiterName: validatedData.recruiterName ?? null,
        jobUrl: jobUrl ?? null,
        salary: validatedData.salary ?? null,
        currency: validatedData.currency ?? "USD",
        followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : null,
        priority: validatedData.priority,
        tags: validatedData.tags,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ data: application }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
