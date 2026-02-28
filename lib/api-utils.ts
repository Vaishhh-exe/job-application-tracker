import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"

export type ApiError = {
  error: string
  details?: string | Record<string, string[]>
  code?: string
}

export type ApiSuccess<T> = {
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Standard error responses
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = "AppError"
  }
}

// Format Zod validation errors
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}
  
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "root"
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(issue.message)
  }
  
  return formatted
}

// Handle various error types and return appropriate response
export function handleApiError(error: unknown): NextResponse<ApiError> {
  console.error("API Error:", error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: formatZodErrors(error),
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    )
  }

  // Custom application errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return NextResponse.json(
          {
            error: "A record with this value already exists",
            code: "DUPLICATE_ENTRY",
          },
          { status: 409 }
        )
      case "P2025":
        return NextResponse.json(
          {
            error: "Record not found",
            code: "NOT_FOUND",
          },
          { status: 404 }
        )
      case "P2003":
        return NextResponse.json(
          {
            error: "A related record was not found.",
            code: "FOREIGN_KEY_ERROR",
          },
          { status: 400 }
        )
      default:
        return NextResponse.json(
          {
            error: "Database error",
            code: error.code,
          },
          { status: 500 }
        )
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: "Invalid data provided",
        code: "PRISMA_VALIDATION_ERROR",
      },
      { status: 400 }
    )
  }

  // Generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message || "An unexpected error occurred",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    )
  }

  // Unknown errors
  return NextResponse.json(
    {
      error: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    },
    { status: 500 }
  )
}

// Success response helper
export function successResponse<T>(
  data: T,
  meta?: ApiSuccess<T>["meta"],
  status: number = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data, meta }, { status })
}

// Pagination helper
export function getPaginationMeta(
  page: number,
  limit: number,
  total: number
): ApiSuccess<unknown>["meta"] {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }
}
