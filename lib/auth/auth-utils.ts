import { cookies } from "next/headers"
import type { NextRequest, NextResponse } from "next/server"
import * as jose from "jose"
import bcrypt from "bcryptjs"
import type { User, UserRole, AuthResult } from "@/types"
import { UnauthorizedError, ForbiddenError } from "@/types/api"

// Constants
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key_for_development"
const AUTH_COOKIE_NAME = "auth-token"
const TOKEN_EXPIRY = "1d"

// Type for JWT payload
interface JwtPayload {
  id: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare a password with a hash
 */
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a JWT token
 */
export async function generateAuthToken(payload: Omit<JwtPayload, "iat" | "exp">): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)

  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret)
}

/**
 * Verify a JWT token
 */
export async function verifyAuthToken(token: string): Promise<JwtPayload> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)

    return payload as JwtPayload
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired token")
  }
}

/**
 * Set auth token in cookies
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  })
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

/**
 * Get auth token from request
 */
export function getAuthToken(request: NextRequest): string | undefined {
  // Try to get token from cookies
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

  if (token) {
    return token
  }

  // Try to get token from Authorization header
  const authHeader = request.headers.get("Authorization")

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  return undefined
}

/**
 * Get current user from server context
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const payload = await verifyAuthToken(token)

    // In a real app, you would fetch the user from the database
    // This is a simplified version
    return {
      id: payload.id,
      email: payload.email,
      name: "User", // This would come from the database
      role: payload.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  } catch (error) {
    return null
  }
}

/**
 * Check if user has required role
 */
export function checkUserRole(user: User | null | undefined, requiredRoles: UserRole[]): void {
  if (!user) {
    throw new UnauthorizedError()
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    throw new ForbiddenError("You do not have permission to access this resource")
  }
}

/**
 * Format authentication result
 */
export function formatAuthResult(success: boolean, message: string, user?: User, token?: string): AuthResult {
  return {
    success,
    message,
    user,
    token,
  }
}
