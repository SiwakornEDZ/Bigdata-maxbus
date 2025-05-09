import type { NextRequest } from "next/server"
import type { User, UserRole } from "./index"

// API route handler types
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

export interface RouteHandlerContext {
  params: Record<string, string>
}

export interface AuthenticatedRequest extends NextRequest {
  user?: User
}

// API middleware types
export interface MiddlewareConfig {
  requireAuth?: boolean
  allowedRoles?: UserRole[]
  allowedMethods?: HttpMethod[]
}

// API error types
export class ApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.name = "ApiError"
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(message, 404)
    this.name = "NotFoundError"
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(message, 403)
    this.name = "ForbiddenError"
  }
}

export class ValidationError extends ApiError {
  errors?: Record<string, string[]>

  constructor(message = "Validation error", errors?: Record<string, string[]>) {
    super(message, 422)
    this.name = "ValidationError"
    this.errors = errors
  }
}
