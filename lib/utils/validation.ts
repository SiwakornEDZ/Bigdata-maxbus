import { z } from "zod"
import type { ValidationError } from "@/types/api"

/**
 * Validate data against a Zod schema
 */
export async function validateData<T>(
  schema: z.ZodType<T>,
  data: unknown,
): Promise<{ success: boolean; data?: T; error?: ValidationError }> {
  try {
    const validatedData = await schema.parseAsync(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod errors into a more usable structure
      const formattedErrors: Record<string, string[]> = {}

      for (const issue of error.errors) {
        const path = issue.path.join(".")

        if (!formattedErrors[path]) {
          formattedErrors[path] = []
        }

        formattedErrors[path].push(issue.message)
      }

      const validationError = new ValidationError("Validation failed", formattedErrors)

      return {
        success: false,
        error: validationError,
      }
    }

    return {
      success: false,
      error: new ValidationError("Validation failed"),
    }
  }
}

// Common validation schemas
export const emailSchema = z.string().email("Invalid email address")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

export const userCredentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const userRegistrationSchema = userCredentialsSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
  search: z.string().optional(),
})
