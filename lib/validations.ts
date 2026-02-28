import { z } from "zod"

// Application status enum
export const ApplicationStatusSchema = z.enum([
  "applied",
  "interview",
  "offer",
  "rejected",
  "ghosted",
])

// Priority enum
export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"])

// Base application schema for creation
export const CreateApplicationSchema = z.object({
  company: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  role: z
    .string()
    .min(1, "Role is required")
    .max(100, "Role must be less than 100 characters"),
  status: ApplicationStatusSchema.default("applied"),
  appliedDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").nullable().optional(),
  recruiterName: z.string().max(100, "Recruiter name must be less than 100 characters").nullable().optional(),
  jobUrl: z.string().url("Invalid URL format").nullable().optional().or(z.literal("")),
  salary: z.number().int().positive("Salary must be a positive number").nullable().optional(),
  currency: z.string().max(10, "Currency code must be less than 10 characters").nullable().optional(),
  followUpDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid follow-up date format")
    .nullable()
    .optional(),
  priority: PrioritySchema.default("MEDIUM"),
  tags: z.array(z.string().max(50)).max(10, "Maximum 10 tags allowed").default([]),
})

// Schema for updating application (all fields optional)
export const UpdateApplicationSchema = z.object({
  company: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters")
    .optional(),
  role: z
    .string()
    .min(1, "Role is required")
    .max(100, "Role must be less than 100 characters")
    .optional(),
  status: ApplicationStatusSchema.optional(),
  appliedDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
    .optional(),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").nullable().optional(),
  recruiterName: z.string().max(100, "Recruiter name must be less than 100 characters").nullable().optional(),
  jobUrl: z.string().url("Invalid URL format").nullable().optional().or(z.literal("")),
  salary: z.number().int().positive("Salary must be a positive number").nullable().optional(),
  currency: z.string().max(10, "Currency code must be less than 10 characters").nullable().optional(),
  followUpDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid follow-up date format")
    .nullable()
    .optional(),
  priority: PrioritySchema.optional(),
  tags: z.array(z.string().max(50)).max(10, "Maximum 10 tags allowed").optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required to update",
})

// Query params for GET applications
export const GetApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["appliedDate", "createdAt", "priority"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: ApplicationStatusSchema.optional(),
  search: z.string().max(100).optional(),
})

// Type exports
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>
export type UpdateApplicationInput = z.infer<typeof UpdateApplicationSchema>
export type GetApplicationsQuery = z.infer<typeof GetApplicationsQuerySchema>
