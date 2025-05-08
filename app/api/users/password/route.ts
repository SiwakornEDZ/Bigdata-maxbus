import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current password and new password are required" },
        { status: 400 },
      )
    }

    // Get user with password
    const users = await sql`
    SELECT * FROM users WHERE id = ${user.id}
  `

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, users[0].password_hash)
    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    // Update password
    await sql`
    UPDATE users
    SET password_hash = ${passwordHash}, updated_at = NOW()
    WHERE id = ${user.id}
  `

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ success: false, message: "An error occurred while changing password" }, { status: 500 })
  }
}
