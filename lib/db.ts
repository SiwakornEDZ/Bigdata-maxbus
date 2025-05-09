import { neon, neonConfig } from "@neondatabase/serverless"
import { Pool } from "pg"
import type { ApiResponse, QueryResult } from "@/types"

// Configure neon to use WebSockets
neonConfig.webSocketConstructor = globalThis.WebSocket
neonConfig.fetchConnectionCache = true

// Check if DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined")
}

// Create SQL client
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null

// Create connection pool for more complex operations
let pool: Pool | null = null

/**
 * Get database connection pool
 */
export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined")
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })
  }

  return pool
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

    const result = await sql.raw(query, params)

    return {
      success: true,
      data: result.rows as T[],
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
    const result = await sql.raw(query, params)
    const executionTime = performance.now() - startTime

    // Extract column names from the first row
    const columns = result.rows.length > 0 ? Object.keys(result.rows[0]) : []

    return {
      success: true,
      data: {
        columns,
        rows: result.rows,
        rowCount: result.rowCount,
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
export async function testConnection(): Promise<boolean> {
  try {
    if (!sql) {
      return false
    }

    await sql`SELECT 1`
    return true
  } catch (error) {
    console.error("Database connection check failed:", error)
    return false
  }
}

/**
 * Close database connections
 */
export async function closeConnections(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

/**
 * Transaction helper
 */
export async function withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await getPool().connect()

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
      tables: result.map((row) => row.table_name),
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
        password VARCHAR(255) NOT NULL,
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
        connection_string TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create reports table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        query TEXT,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create sql_history table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS sql_history (
        id SERIAL PRIMARY KEY,
        query TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time INTEGER,
        row_count INTEGER
      )
    `

    // Create saved_queries table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS saved_queries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        query_text TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Seed admin user if users table is empty
    const userCount = await sql`SELECT COUNT(*) FROM users`
    if (userCount[0].count === "0") {
      // Default password: admin123 (in a real app, this would be hashed)
      await sql`
        INSERT INTO users (name, email, password, role)
        VALUES ('Admin User', 'admin@example.com', 'admin123', 'admin')
      `
    }

    return { success: true }
  } catch (error) {
    console.error("Error initializing database:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error initializing database",
    }
  }
}
