import { NextResponse } from "next/server"
import { createApiHandler } from "@/lib/utils/api-handler"
import { getCurrentUser } from "@/lib/auth/auth-utils"

async function getMeHandler(): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
  }

  return NextResponse.json({
    success: true,
    user,
  })
}

export const GET = createApiHandler(
  {
    GET: getMeHandler,
  },
  { requireAuth: true },
)
