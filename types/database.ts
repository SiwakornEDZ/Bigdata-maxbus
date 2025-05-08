export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
}

export interface TableInfo {
  name: string
  columns: ColumnInfo[]
  sampleData: any[]
  rowCount: number
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

export interface QueryResult {
  success: boolean
  data?: any[]
  error?: string
  code?: string
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
  tables: {
    name: string
    rowCount: number
    columnCount: number
  }[]
}
