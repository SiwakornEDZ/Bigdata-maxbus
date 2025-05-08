import { sql } from "@/lib/db"
import * as jose from "jose"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key_for_development"

export interface User {
  id: number
  name: string
  email: string
  role: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
  } catch (error) {
    console.error("Error hashing password:", error)
    throw new Error("Failed to hash password")
  }
}

// Compare password
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  try {
    return bcrypt.compare(password, hash)
  } catch (error) {
    console.error("Error comparing passwords:", error)
    throw new Error("Failed to compare passwords")
  }
}

// Generate JWT token
export async function generateAuthToken(user: { id: number; email: string; role: string }): Promise<string> {
  try {
    const alg = "HS256"
    const secret = new TextEncoder().encode(JWT_SECRET)

    const jwt = await new jose.SignJWT({ id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret)

    return jwt
  } catch (error) {
    console.error("Error generating auth token:", error)
    throw new Error("Failed to generate authentication token")
  }
}

// Verify auth from request or token
export async function verifyAuth(requestOrToken: NextRequest | string) {
  try {
    // Extract token based on input type
    let token: string | undefined

    if (typeof requestOrToken === "string") {
      // If a string is passed, use it directly as the token
      token = requestOrToken
    } else {
      // If a NextRequest is passed, extract token from cookies
      token = requestOrToken.cookies.get("auth-token")?.value
    }

    // If no token, return not authenticated
    if (!token) {
      return { success: false, authenticated: false, message: "No authentication token" }
    }

    // Verify the token
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)

    if (!payload || !payload.id) {
      return { success: false, authenticated: false, message: "Invalid token payload" }
    }

    return {
      success: true,
      authenticated: true,
      userId: payload.id,
      role: payload.role,
    }
  } catch (error) {
    console.error("Auth verification error:", error)
    return {
      success: false,
      authenticated: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get user from token
export async function getUserFromToken(token: string) {
  try {
    if (!token) return null

    // Verify and decode token
    const { success, userId } = await verifyAuth(token)

    if (!success || !userId) {
      return null
    }

    // Get user from database
    const users = await sql`
      SELECT id, email, name, role, created_at, updated_at
      FROM users
      WHERE id = ${userId}
    `

    if (users.length === 0) {
      return null
    }

    return {
      id: users[0].id,
      email: users[0].email,
      name: users[0].name,
      role: users[0].role,
      createdAt: users[0].created_at,
      updatedAt: users[0].updated_at,
    }
  } catch (error) {
    console.error("Error getting user from token:", error)
    return null
  }
}

// Get current user from cookie
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    return getUserFromToken(token)
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Login user
export async function login(
  email: string,
  passwordPlain: string,
): Promise<{ success: boolean; message?: string; token?: string; user?: any }> {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return { success: false, message: "Database connection not configured" }
    }

    const users = await sql`SELECT * FROM users WHERE email = ${email}`

    if (users.length === 0) {
      return { success: false, message: "Invalid credentials" }
    }

    const user = users[0]

    // Compare password
    const passwordMatch = await comparePasswords(passwordPlain, user.password_hash)

    if (!passwordMatch) {
      return { success: false, message: "Invalid credentials" }
    }

    // Generate JWT token
    const token = await generateAuthToken({ id: user.id, email: user.email, role: user.role })

    // Exclude password_hash from the user object
    const { password_hash, ...userWithoutHash } = user

    return { success: true, token: token, user: userWithoutHash }
  } catch (error: any) {
    console.error("Login error:", error)
    return { success: false, message: "Login failed: " + error.message }
  }
}

// Register user
export async function register(
  name: string,
  email: string,
  passwordPlain: string,
): Promise<{ success: boolean; message?: string; token?: string; user?: any }> {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return { success: false, message: "Database connection not configured" }
    }

    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`

    if (existingUser.length > 0) {
      return { success: false, message: "Email already in use" }
    }

    const passwordHash = await hashPassword(passwordPlain)

    const result = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${passwordHash}, ${"user"})
      RETURNING id, name, email, role
    `

    const user = result[0]

    // Generate JWT token
    const token = await generateAuthToken({ id: user.id, email: user.email, role: user.role })

    return { success: true, token: token, user: user }
  } catch (error: any) {
    console.error("Registration error:", error)
    return { success: false, message: "Registration failed: " + error.message }
  }
}
