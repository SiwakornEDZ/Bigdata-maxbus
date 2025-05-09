import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { createHash } from "crypto"

// Use crypto แทน bcrypt
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const userData = await sql`
        SELECT id, username, email, role, created_at, last_login
        FROM users
        WHERE id = ${id}
      `
      if (userData.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      return NextResponse.json(userData[0])
    }

    const users = await sql`
      SELECT id, username, email, role, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username, email, password, role } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = hashPassword(password)

    // Create user
    const newUser = await sql`
      INSERT INTO users (
        id,
        username,
        email,
        password,
        role,
        created_at
      )
      VALUES (
        ${uuidv4()},
        ${username},
        ${email},
        ${hashedPassword},
        ${role || "user"},
        NOW()
      )
      RETURNING id, username, email, role, created_at
    `

    return NextResponse.json(newUser[0])
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, username, email, password, role } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE id = ${id}
    `

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Build update query
    const updateQuery = sql`
      UPDATE users
      SET 
    `

    const updates = []
    const values = []

    if (username) {
      updates.push(sql`username = ${username}`)
    }

    if (email) {
      updates.push(sql`email = ${email}`)
    }

    if (role) {
      updates.push(sql`role = ${role}`)
    }

    if (password) {
      const hashedPassword = hashPassword(password)
      updates.push(sql`password = ${hashedPassword}`)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    // Join all updates with commas
    const finalQuery = sql`
      ${updateQuery} ${sql.join(updates, sql`, `)}
      WHERE id = ${id}
      RETURNING id, username, email, role, created_at
    `

    const updatedUser = await finalQuery

    return NextResponse.json(updatedUser[0])
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE id = ${id}
    `

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user
    await sql`
      DELETE FROM users
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

