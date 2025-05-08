import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching profile data" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 })
    }

    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ success: false, message: "Name and email are required" }, { status: 400 })
    }

    // Check if email is already in use by another user
    if (email !== user.email) {
      const existingUsers = await sql`
      SELECT * FROM users WHERE email = ${email} AND id != ${user.id}
    `

      if (existingUsers.length > 0) {
        return NextResponse.json({ success: false, message: "Email already in use" }, { status: 400 })
      }
    }

    // Update user
    const result = await sql`
    UPDATE users
    SET name = ${name}, email = ${email}, updated_at = NOW()
    WHERE id = ${user.id}
    RETURNING id, name, email, role
  `

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ success: true, user: result[0] })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ success: false, message: "An error occurred while updating profile" }, { status: 500 })
  }
}
