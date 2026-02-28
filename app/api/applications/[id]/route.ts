import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { UpdateApplicationSchema } from "@/lib/validations"
import { handleApiError, AppError } from "@/lib/api-utils"

// UPDATE an application
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED")
    }

    const { id } = await params

    if (!id) {
      throw new AppError("Application ID is required", 400, "MISSING_ID")
    }

    const body = await req.json()
    
    // Validate request body
    const validatedData = UpdateApplicationSchema.parse(body)

    // Check if the application exists and belongs to the user
    const existingApplication = await prisma.application.findUnique({
      where: { id },
    })

    if (!existingApplication) {
      throw new AppError("Application not found", 404, "NOT_FOUND")
    }
    
    if (existingApplication.userId !== session.user.id) {
      throw new AppError("Forbidden", 403, "FORBIDDEN")
    }

    // Build update data object
    const updateData: any = {}
    if (validatedData.company !== undefined) updateData.company = validatedData.company
    if (validatedData.role !== undefined) updateData.role = validatedData.role
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.appliedDate !== undefined) {
      updateData.appliedDate = validatedData.appliedDate ? new Date(validatedData.appliedDate) : null
    }
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes ?? null
    if (validatedData.recruiterName !== undefined) updateData.recruiterName = validatedData.recruiterName ?? null
    if (validatedData.jobUrl !== undefined) {
      updateData.jobUrl = validatedData.jobUrl === "" ? null : validatedData.jobUrl ?? null
    }
    if (validatedData.salary !== undefined) updateData.salary = validatedData.salary ?? null
    if (validatedData.currency !== undefined) updateData.currency = validatedData.currency ?? null
    if (validatedData.followUpDate !== undefined) {
      updateData.followUpDate = validatedData.followUpDate ? new Date(validatedData.followUpDate) : null
    }
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags ?? []

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ data: updatedApplication })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE an application
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED")
    }

    const { id } = await params

    if (!id) {
      throw new AppError("Application ID is required", 400, "MISSING_ID")
    }

    // Check if the application exists and belongs to the user
    const existingApplication = await prisma.application.findUnique({
      where: { id },
    })

    if (!existingApplication) {
      throw new AppError("Application not found", 404, "NOT_FOUND")
    }

    if (existingApplication.userId !== session.user.id) {
      throw new AppError("Forbidden", 403, "FORBIDDEN")
    }

    // Delete the application
    const deletedApplication = await prisma.application.delete({
      where: { id },
    })

    return NextResponse.json({ data: deletedApplication })
  } catch (error) {
    return handleApiError(error)
  }
}