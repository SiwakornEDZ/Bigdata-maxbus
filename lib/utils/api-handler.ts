import { type NextRequest, NextResponse } from "next/server"
import type { RouteHandlerContext, MiddlewareConfig, HttpMethod } from "@/types/api"
import { getAuthToken, verifyAuthToken } from "@/lib/auth/auth-utils"

/**
 * API route handler with middleware support
 */
export function createApiHandler(
  handlers: Partial<Record<HttpMethod, (req: NextRequest, context: RouteHandlerContext) => Promise<NextResponse>>>,
  config: MiddlewareConfig = {},
) {
  return async (req: NextRequest, context: RouteHandlerContext): Promise<NextResponse> => {
    try {
      // Check if method is allowed
      const method = req.method as HttpMethod

      if (config.allowedMethods && !config.allowedMethods.includes(method)) {
        return NextResponse.json({ success: false, error: `Method ${method} not allowed` }, { status: 405 })
      }

      // Check if handler exists for this method
      const handler = handlers[method]

      if (!handler) {
        return NextResponse.json({ success: false, error: `Method ${method} not implemented` }, { status: 501 })
      }

      // Check authentication if required
      if (config.requireAuth) {
        const token = getAuthToken(req)

        if (!token) {
          return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
        }

        try {
          const payload = await verifyAuthToken(token)

          // Add user to request
          ;(req as any).user = {
            id: payload.id,
            email: payload.email,
            role: payload.role,
          }

          // Check roles if specified
          if (config.allowedRoles && config.allowedRoles.length > 0) {
            if (!config.allowedRoles.includes(payload.role)) {
              return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
            }
          }
        } catch (error) {
          return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 })
        }
      }

      // Execute handler
      return await handler(req, context)
    } catch (error) {
      console.error("API error:", error)

      // Handle known error types
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            ...(error.name === "ValidationError" && (error as any).errors ? { errors: (error as any).errors } : {}),
          },
          { status: error.statusCode },
        )
      }

      // Handle unknown errors
      return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  }
}
