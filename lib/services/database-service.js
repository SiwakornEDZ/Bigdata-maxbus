import { sql } from "@/lib/db"

// Database service for common database operations
export const databaseService = {
  // Execute a raw SQL query
  async executeQuery(query, params = []) {
    try {
      if (!sql) {
        throw new Error("Database connection not initialized")
      }

      // Use tagged template for SQL query
      const result = await sql.raw(query, params)
      return { success: true, data: result.rows }
    } catch (error) {
      console.error("Error executing query:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error executing query",
      }
    }
  },

  // Get all tables in the database
  async getAllTables() {
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
  },

  // Check if a table exists
  async tableExists(tableName) {
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

      return {
        success: true,
        exists: result[0].exists,
      }
    } catch (error) {
      console.error(`Error checking if table ${tableName} exists:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : `Unknown error checking if table ${tableName} exists`,
      }
    }
  },

  // Get table structure
  async getTableStructure(tableName) {
    try {
      if (!sql) {
        throw new Error("Database connection not initialized")
      }

      const result = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
        ORDER BY ordinal_position
      `

      return {
        success: true,
        columns: result,
      }
    } catch (error) {
      console.error(`Error getting structure for table ${tableName}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : `Unknown error getting structure for table ${tableName}`,
      }
    }
  },

  // Get database statistics
  async getDatabaseStats() {
    try {
      if (!sql) {
        throw new Error("Database connection not initialized")
      }

      // Get table count
      const tableCountResult = await sql`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `

      // Get row counts for each table
      const tableStatsResult = await sql`
        SELECT 
          table_name,
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count,
          pg_total_relation_size(quote_ident(table_name)) as size_bytes
        FROM information_schema.tables t
        WHERE table_schema = 'public'
        ORDER BY table_name
      `

      // Get row counts (this is more complex and might be slow on large tables)
      const rowCountPromises = tableStatsResult.map(async (table) => {
        try {
          const countResult = await sql.raw(`SELECT COUNT(*) as count FROM "${table.table_name}"`)
          return {
            table_name: table.table_name,
            row_count: Number.parseInt(countResult.rows[0].count, 10),
          }
        } catch (err) {
          console.error(`Error counting rows in ${table.table_name}:`, err)
          return {
            table_name: table.table_name,
            row_count: 0,
          }
        }
      })

      const rowCounts = await Promise.all(rowCountPromises)

      // Combine the results
      const tableStats = tableStatsResult.map((table) => {
        const rowCountInfo = rowCounts.find((r) => r.table_name === table.table_name)
        return {
          table_name: table.table_name,
          column_count: Number.parseInt(table.column_count, 10),
          row_count: rowCountInfo ? rowCountInfo.row_count : 0,
          size_bytes: Number.parseInt(table.size_bytes, 10),
          size_formatted: formatBytes(Number.parseInt(table.size_bytes, 10)),
        }
      })

      return {
        success: true,
        table_count: Number.parseInt(tableCountResult[0].count, 10),
        tables: tableStats,
      }
    } catch (error) {
      console.error("Error getting database stats:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error getting database stats",
      }
    }
  },
}

// Helper function to format bytes
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}
