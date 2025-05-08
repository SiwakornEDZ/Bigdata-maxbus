import { type NextRequest, NextResponse } from "next/server"
import { login } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    const result = await login(email, password)

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message || "Invalid credentials" }, { status: 401 })
    }

    // Set cookie with JWT token
    const response = NextResponse.json({ success: true, user: result.user })

    response.cookies.set({
      name: "auth-token",
      value: result.token || "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed from strict to lax for better compatibility
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    return response
  } catch (error: any) {
    console.error("Login API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during login",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
