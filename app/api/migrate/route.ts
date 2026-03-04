import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force migration route - call this to manually trigger database migration
export async function POST(req: Request) {
  try {
    // Check if user table exists and has apiToken field
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'apiToken'
    `;

    if (Array.isArray(result) && result.length === 0) {
      // apiToken field doesn't exist, need to add it
      await prisma.$queryRaw`
        ALTER TABLE "User" 
        ADD COLUMN "apiToken" TEXT,
        ADD COLUMN "apiTokenCreatedAt" TIMESTAMP(3)
      `;

      await prisma.$queryRaw`
        CREATE UNIQUE INDEX "User_apiToken_key" ON "User"("apiToken");
      `;

      return NextResponse.json({ 
        success: true, 
        message: "Database migration completed successfully" 
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: "Database already has required fields" 
      });
    }
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      message: "Migration failed - this is expected if fields already exist"
    }, { status: 500 });
  }
}

// GET - Check migration status
export async function GET() {
  try {
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name IN ('apiToken', 'apiTokenCreatedAt')
    `;

    return NextResponse.json({ 
      hasMigration: Array.isArray(result) && result.length >= 2,
      fieldsFound: result,
      message: Array.isArray(result) && result.length >= 2 
        ? "Migration complete" 
        : "Migration needed"
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      hasMigration: false 
    }, { status: 500 });
  }
}