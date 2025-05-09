// Common type definitions for the entire application

// User related types
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type UserRole = "admin" | "user" | "analyst" | "manager"

export interface UserCredentials {
  email: string
  password: string
}

export interface UserRegistration extends UserCredentials {
  name: string
}

// Authentication related types
export interface AuthResult {
  success: boolean
  message: string
  user?: User
  token?: string
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Data source related types
export interface DataSource {
  id: string
  name: string
  description?: string
  type: DataSourceType
  connectionString?: string
  status: ConnectionStatus
  createdAt: string
  updatedAt: string
  createdBy: string
}

export type DataSourceType = "database" | "api" | "file" | "streaming"
export type ConnectionStatus = "connected" | "disconnected" | "error" | "pending"

// Database related types
export interface TableInfo {
  name: string
  columns: ColumnInfo[]
  rowCount: number
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
}

export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  executionTime: number
}

// Import job related types
export interface ImportJob {
  id: string
  name: string
  description?: string
  sourceType: "csv" | "json" | "excel" | "parquet" | "avro"
  status: ImportJobStatus
  progress: number
  totalRows: number
  processedRows: number
  errorCount: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export type ImportJobStatus = "pending" | "processing" | "completed" | "failed" | "cancelled"

// Environment related types
export interface EnvironmentStatus {
  databaseConnected: boolean
  databaseError?: string
  databaseTables?: string[]
  envVars: {
    DATABASE_URL: boolean
    JWT_SECRET: boolean
    [key: string]: boolean
  }
}

// Notification related types
export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
}

export type NotificationType = "info" | "success" | "warning" | "error"
