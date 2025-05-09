import { NextResponse } from "next/server"
import { createHash } from "crypto"
import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

// Use crypto instead of bcrypt
function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex")
}

export async function POST(request) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT * FROM users WHERE email = ${email} OR username = ${username}
    `

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0]
      if (existingUser.email === email) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 })
      }
      if (existingUser.username === username) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 })
      }
    }

    // Hash password
    const hashedPassword = hashPassword(password)

    // Create user
    const result = await sql`
      INSERT INTO users (id, username, email, password, role, created_at)
      VALUES (
        ${uuidv4()},
        ${username},
        ${email},
        ${hashedPassword},
        ${"user"},
        NOW()
      )
      RETURNING id, username, email, role
    `

    return NextResponse.json({ user: result[0] })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
