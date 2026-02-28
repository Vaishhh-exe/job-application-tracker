import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/settings - Get user preferences
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        defaultStatus: true,
        defaultPriority: true,
        defaultCurrency: true,
        dateFormat: true,
        theme: true,
        accentColor: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/settings - Update user preferences
export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Only allow updating specific fields
    const allowedFields = [
      "name",
      "defaultStatus",
      "defaultPriority",
      "defaultCurrency",
      "dateFormat",
      "theme",
      "accentColor",
    ]

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
      select: {
        name: true,
        email: true,
        image: true,
        defaultStatus: true,
        defaultPriority: true,
        defaultCurrency: true,
        dateFormat: true,
        theme: true,
        accentColor: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
