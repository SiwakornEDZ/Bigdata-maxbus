import { type NextRequest, NextResponse } from "next/server"
import { createApiHandler } from "@/lib/utils/api-handler"
import { validateData, userRegistrationSchema } from "@/lib/utils/validation"
import { hashPassword, generateAuthToken, setAuthCookie, formatAuthResult } from "@/lib/auth/auth-utils"
import { executeQuery, withTransaction } from "@/lib/db"
import type { User } from "@/types"

async function registerHandler(req: NextRequest): Promise<NextResponse> {
  // Parse and validate request body
  const body = await req.json()
  const validation = await validateData(userRegistrationSchema, body)

  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: validation.error?.message, errors: validation.error?.errors },
      { status: 422 },
    )
  }

  const { name, email, password } = validation.data

  // Check if email already exists
  const existingUser = await executeQuery<User>("SELECT * FROM users WHERE email = $1", [email])

  if (existingUser.success && existingUser.data && existingUser.data.length > 0) {
    return NextResponse.json(formatAuthResult(false, "Email already in use"), { status: 409 })
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user with transaction
  const result = await withTransaction(async (client) => {
    const result = await client.query(
      `INSERT INTO users (name, email, password, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword, "user"],
    )

    return result.rows[0]
  })

  // Format user data
  const user: User = {
    id: result.id,
    name: result.name,
    email: result.email,
    role: result.role,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  }

  // Generate token
  const token = await generateAuthToken({
    id: user.id,
    email: user.email,
    role: user.role,
  })

  // Create response
  const response = NextResponse.json(formatAuthResult(true, "Registration successful", user, token), { status: 201 })

  // Set auth cookie
  setAuthCookie(response, token)

  return response
}

export const POST = createApiHandler({
  POST: registerHandler,
})
