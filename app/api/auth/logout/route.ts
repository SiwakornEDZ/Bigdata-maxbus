import { NextResponse } from "next/server"
import { createApiHandler } from "@/lib/utils/api-handler"
import { clearAuthCookie } from "@/lib/auth/auth-utils"

async function logoutHandler(): Promise<NextResponse> {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  })

  clearAuthCookie(response)

  return response
}

export const POST = createApiHandler({
  POST: logoutHandler,
})
