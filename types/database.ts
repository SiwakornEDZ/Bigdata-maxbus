export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
}

// กำหนด type สำหรับข้อมูลตาราง
export interface TableInfo {
  name: string
  rowCount: number
  size: string
}

export interface TableExistsResponse {
  exists: boolean
  message?: string
}

export interface TableStructureResponse {
  success: boolean
  data?: TableInfo
  error?: string
}

export interface AllTablesResponse {
  success: boolean
  tables: string[]
  error?: string
}

export interface ImportJob {
  id: number
  filename: string
  tableName: string
  status: "pending" | "processing" | "completed" | "completed_with_errors" | "failed"
  rowsProcessed: number
  totalRows: number
  error?: string
  createdAt: string
  updatedAt: string
}

// กำหนด type สำหรับผลลัพธ์ของ query
export interface QueryResult {
  columns: string[]
  rows: Record<string, any>[]
  rowCount: number
  executionTime: number
}

export interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface DatabaseStats {
  tableCount: number
  totalSize: string
  tables: TableInfo[]
}

export interface TableSchema {
  name: string
  columns: ColumnInfo[]
}
