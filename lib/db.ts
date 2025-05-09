import { neon } from "@neondatabase/serverless"
import { Pool } from "pg"

// Define the type for API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

let sql: any

if (process.env.DATABASE_URL) {
  sql = neon(process.env.DATABASE_URL)
}

/**
 * Execute a SQL query with parameters
 */
export async function executeQuery<T = Record<string, unknown>>(
  query: string,
  params: unknown[] = [],
): Promise<ApiResponse<T[]>> {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    const result = await sql(query, params)

    return {
      success: true,
      data: result as T[],
    }
  } catch (error) {
    console.error("Error executing query:", error)

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

/**
 * Execute a SQL query and return a formatted result
 */
export async function executeQueryFormatted(query: string, params: unknown[] = []): Promise<ApiResponse<QueryResult>> {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    const startTime = performance.now()
    const result = await sql(query, params)
    const executionTime = performance.now() - startTime

    // Extract column names from the first row
    const columns = result.length > 0 ? Object.keys(result[0]) : []

    return {
      success: true,
      data: {
        columns,
        rows: result,
        rowCount: result.length,
        executionTime,
      },
    }
  } catch (error) {
    console.error("Error executing query:", error)

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

/**
 * Check database connection
 */
export async function testConnection(): Promise<{ connected: boolean; message?: string }> {
  try {
    if (!sql) {
      return { connected: false, message: "Database connection not initialized" }
    }

    await sql`SELECT 1`
    return { connected: true }
  } catch (error) {
    console.error("Database connection check failed:", error)
    return { connected: false, message: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * Helper function to format bytes
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

/**
 * Check if a table exists
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    const result = await sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      ) as exists
    `

    return result[0].exists
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

/**
 * Get all tables in the database
 */
export async function getAllTables() {
  try {
    if (!sql) {
      throw new Error("Database connection not initialized")
    }

    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    return {
      success: true,
      tables: result.map((row: any) => row.table_name),
    }
  } catch (error) {
    console.error("Error getting tables:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error getting tables",
    }
  }
}

/**
 * Initialize database with required tables
 */
export async function initializeDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      return { success: false, error: "DATABASE_URL is not defined" }
    }

    if (!sql) {
      return { success: false, error: "SQL client is not initialized" }
    }

    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create data_sources table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS data_sources (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        connection_details JSONB,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create reports table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        created_by VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled',
        scheduled_for TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create system_logs table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS system_logs (
        id SERIAL PRIMARY KEY,
        log_id VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        service VARCHAR(255) NOT NULL,
        level VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        details JSONB
      )
    `

    // Create query_history table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS query_history (
        id SERIAL PRIMARY KEY,
        query TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time INTEGER,
        row_count INTEGER,
        status VARCHAR(50) DEFAULT 'completed'
      )
    `

    // Create saved_queries table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS saved_queries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        query_text TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_count INTEGER DEFAULT 0,
        last_executed_at TIMESTAMP
      )
    `

    // Create storage_metrics table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS storage_metrics (
        id SERIAL PRIMARY KEY,
        total_space BIGINT NOT NULL,
        used_space BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create storage_activities table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS storage_activities (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        resource VARCHAR(255) NOT NULL,
        size BIGINT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create storage_distribution table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS storage_distribution (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        size BIGINT NOT NULL,
        color VARCHAR(50) NOT NULL
      )
    `

    // Create analytics_overview table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_overview (
        id SERIAL PRIMARY KEY,
        total_users INTEGER NOT NULL,
        active_users INTEGER NOT NULL,
        total_queries INTEGER NOT NULL,
        total_data_sources INTEGER NOT NULL,
        total_storage BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create analytics_usage table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_usage (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        queries INTEGER NOT NULL,
        data_processed BIGINT NOT NULL,
        active_users INTEGER NOT NULL
      )
    `

    // Create analytics_performance table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_performance (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        response_time INTEGER NOT NULL,
        cpu_usage INTEGER NOT NULL,
        memory_usage INTEGER NOT NULL
      )
    `

    // Create analytics_user_activities table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS analytics_user_activities (
        id SERIAL PRIMARY KEY,
        activity VARCHAR(255) NOT NULL,
        count INTEGER NOT NULL,
        color VARCHAR(50) NOT NULL
      )
    `

    return { success: true }
  } catch (error) {
    console.error("Error initializing database:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error initializing database",
    }
  }
}

export async function withTransaction(callback: (client: any) => Promise<any>): Promise<any> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined")
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

export type QueryResult = any
