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
      
      // For now, allow demo tokens while migration completes
      if (token === 'mrd_temp_development_token_123456789abcdef') {
        return NextResponse.json({ 
          data: {
            id: 'temp_user',
            email: 'demo@example.com', 
            name: 'Demo User',
            image: null
          },
          success: true 
        })
      }
      
      // Try to find user by API token (will fail gracefully if field doesn't exist)
      try {
        const user = await prisma.user.findUnique({
          where: { apiToken: token },
          select: { id: true, email: true, name: true, image: true }
        })
        
        if (!user) {
          throw new AppError("Invalid API token", 401, "INVALID_TOKEN")
        }
        userId = user.id
      } catch (error) {
        // If apiToken field doesn't exist, return error for now
        throw new AppError("API token authentication not available yet", 503, "SERVICE_UNAVAILABLE")
      }
    } else {
      // Fallback to session-based auth
      const session = await auth()
      if (!session?.user?.id) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED")
      }
      userId = session.user.id
    }

    // Fetch user data (without apiToken fields for now)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
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

// POST - Generate new API token (temporarily disabled until migration completes)
export async function POST(req: Request) {
  try {
    return NextResponse.json({
      success: false,
      message: "API token generation temporarily disabled during database migration. Please use the Chrome extension in demo mode for now.",
      demoToken: "mrd_temp_development_token_123456789abcdef"
    }, { status: 503 })
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
