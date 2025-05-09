import { type NextRequest, NextResponse } from "next/server"
import { createApiHandler } from "@/lib/utils/api-handler"
import { validateData, userCredentialsSchema } from "@/lib/utils/validation"
import { comparePasswords, generateAuthToken, setAuthCookie, formatAuthResult } from "@/lib/auth/auth-utils"
import { executeQuery } from "@/lib/db"
import type { User } from "@/types"

async function loginHandler(req: NextRequest): Promise<NextResponse> {
  // Parse and validate request body
  const body = await req.json()
  const validation = await validateData(userCredentialsSchema, body)

  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: validation.error?.message, errors: validation.error?.errors },
      { status: 422 },
    )
  }

  const { email, password } = validation.data

  // Find user by email
  const result = await executeQuery<User & { password: string }>("SELECT * FROM users WHERE email = $1", [email])

  if (!result.success || !result.data || result.data.length === 0) {
    return NextResponse.json(formatAuthResult(false, "Invalid credentials"), { status: 401 })
  }

  const user = result.data[0]

  // Verify password
  const isPasswordValid = await comparePasswords(password, user.password)

  if (!isPasswordValid) {
    return NextResponse.json(formatAuthResult(false, "Invalid credentials"), { status: 401 })
  }

  // Generate token
  const token = await generateAuthToken({
    id: user.id,
    email: user.email,
    role: user.role,
  })

  // Create response
  const response = NextResponse.json(
    formatAuthResult(
      true,
      "Login successful",
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    ),
    { status: 200 },
  )

  // Set auth cookie
  setAuthCookie(response, token)

  return response
}

export const POST = createApiHandler({
  POST: loginHandler,
})
