import { type NextRequest, NextResponse } from "next/server"
import { getAuthToken, verifyAuthToken } from "@/lib/auth/auth-utils"
import type { UserRole } from "@/types"

// Define public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/check-env",
]

// Define routes that require specific roles
const roleRestrictedRoutes: Record<string, UserRole[]> = {
  "/admin": ["admin"],
  "/api/admin": ["admin"],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = getAuthToken(request)

  if (!token) {
    return redirectToLogin(request)
  }

  try {
    // Verify token
    const payload = await verifyAuthToken(token)

    // Check role restrictions
    const requiredRoles = getRequiredRolesForPath(pathname)

    if (requiredRoles.length > 0 && !requiredRoles.includes(payload.role)) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", payload.id)
    requestHeaders.set("x-user-role", payload.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error("Authentication error:", error)
    return redirectToLogin(request)
  }
}

// Helper function to check if a route is public
function isPublicRoute(pathname: string): boolean {
  // Check exact matches
  if (publicRoutes.includes(pathname)) {
    return true
  }

  // Check static files and images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".ico")
  ) {
    return true
  }

  return false
}

// Helper function to get required roles for a path
function getRequiredRolesForPath(pathname: string): UserRole[] {
  // Check exact matches
  if (roleRestrictedRoutes[pathname]) {
    return roleRestrictedRoutes[pathname]
  }

  // Check path prefixes
  for (const [route, roles] of Object.entries(roleRestrictedRoutes)) {
    if (pathname.startsWith(route)) {
      return roles
    }
  }

  return []
}

// Helper function to redirect to login
function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("from", request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!api/auth/register|api/auth/login|_next/static|_next/image|favicon.ico).*)"],
}
