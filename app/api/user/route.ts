import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, AppError } from "@/lib/api-utils"
import { randomBytes } from "crypto"

// GET user profile (for API token validation and user data)
export async function GET(req: Request) {
  try {
    // Check for Bearer token first (for API access)
    const authHeader = req.headers.get("authorization")
    let userId: string | null = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      
      // Find user by API token
      const user = await prisma.user.findUnique({
        where: { apiToken: token },
        select: { id: true, email: true, name: true, image: true }
      })
      
      if (!user) {
        throw new AppError("Invalid API token", 401, "INVALID_TOKEN")
      }
      
      userId = user.id
    } else {
      // Fallback to session-based auth
      const session = await auth()
      if (!session?.user?.id) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED")
      }
      userId = session.user.id
    }

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        apiToken: true,
        apiTokenCreatedAt: true,
        defaultStatus: true,
        defaultPriority: true,
        defaultCurrency: true,
        dateFormat: true,
        theme: true,
        accentColor: true,
        createdAt: true
      }
    })

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND")
    }

    return NextResponse.json({ 
      data: user,
      success: true 
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST - Generate new API token
export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED")
    }

    // Generate a secure random token
    const apiToken = `mrd_${randomBytes(32).toString('hex')}`

    // Update user with new API token
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        apiToken,
        apiTokenCreatedAt: new Date()
      },
      select: {
        id: true,
        apiToken: true,
        apiTokenCreatedAt: true
      }
    })

    return NextResponse.json({
      data: {
        apiToken: user.apiToken,
        createdAt: user.apiTokenCreatedAt
      },
      message: "API token generated successfully",
      success: true
    }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE - Revoke API token or delete user account
export async function DELETE(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action")

    if (action === "revoke-token") {
      // Revoke API token only
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          apiToken: null,
          apiTokenCreatedAt: null
        }
      })

      return NextResponse.json({
        message: "API token revoked successfully",
        success: true
      })
    } else {
      // Delete user account (existing functionality)
      await prisma.user.delete({
        where: { id: session.user.id },
      })

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error("Error in user DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
