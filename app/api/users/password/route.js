import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { createHash } from "crypto"

// Use crypto instead of bcrypt
function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex")
}

function verifyPassword(password, hashedPassword) {
  const hash = createHash("sha256").update(password).digest("hex")
  return hash === hashedPassword
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required" }, { status: 400 })
    }

    // Get user's current password
    const userData = await sql`
      SELECT password FROM users WHERE email = ${user.email}
    `

    if (userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    if (!verifyPassword(currentPassword, userData[0].password)) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
    }

    // Hash new password
    const hashedPassword = hashPassword(newPassword)

    // Update password
    await sql`
      UPDATE users
      SET password = ${hashedPassword}, updated_at = NOW()
      WHERE email = ${user.email}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}
