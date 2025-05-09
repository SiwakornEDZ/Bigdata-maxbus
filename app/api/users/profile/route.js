import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { createHash } from "crypto"

// Use crypto instead of bcrypt
function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex")
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = await sql`
      SELECT id, username, email, role, created_at, last_login
      FROM users
      WHERE email = ${user.email}
    `

    if (userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(userData[0])
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Check if username is already taken
    const existingUser = await sql`
      SELECT id FROM users WHERE username = ${username} AND email != ${user.email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }

    // Update user
    const updatedUser = await sql`
      UPDATE users
      SET username = ${username}, updated_at = NOW()
      WHERE email = ${user.email}
      RETURNING id, username, email, role, created_at, updated_at
    `

    return NextResponse.json(updatedUser[0])
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
  }
}
