import { sql } from "@/lib/db"
import type { TableInfo, QueryResult } from "@/types/database"

/**
 * บริการจัดการฐานข้อมูล
 * รับผิดชอบการทำงานกับฐานข้อมูลทั้งหมด
 */
export class DatabaseService {
  /**
   * ตรวจสอบว่าตารางมีอยู่หรือไม่
   */
  async tableExists(tableName: string): Promise<boolean> {
    try {
      // ตรวจสอบชื่อตารางเพื่อป้องกัน SQL injection
      if (!this.isValidTableName(tableName)) {
        console.error(`Invalid table name: ${tableName}`)
        return false
      }

      const result = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = ${tableName}
        );
      `
      return result[0]?.exists || false
    } catch (error) {
      console.error("Error checking if table exists:", error)
      return false
    }
  }

  /**
   * ดึงข้อมูลโครงสร้างของตาราง
   */
  async getTableStructure(tableName: string): Promise<TableInfo | null> {
    try {
      // ตรวจสอบชื่อตารางเพื่อป้องกัน SQL injection
      if (!this.isValidTableName(tableName)) {
        console.error(`Invalid table name: ${tableName}`)
        return null
      }

      // ตรวจสอบว่าตารางมีอยู่หรือไม่
      const exists = await this.tableExists(tableName)
      if (!exists) {
        return null
      }

      // ดึงข้อมูลคอลัมน์
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
        ORDER BY ordinal_position;
      `

      // ดึงข้อมูลตัวอย่าง
      const sampleData = await sql`
        SELECT * FROM ${sql(tableName)}
        LIMIT 5;
      `

      // นับจำนวนแถวทั้งหมด
      const countResult = await sql`
        SELECT COUNT(*) as total FROM ${sql(tableName)};
      `

      const rowCount = Number.parseInt(countResult[0]?.total || "0")

      return {
        name: tableName,
        columns: columns.map((col) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === "YES",
        })),
        sampleData,
        rowCount,
      }
    } catch (error) {
      console.error(`Error getting table structure for ${tableName}:`, error)
      return null
    }
  }

  /**
   * ดึงรายชื่อตารางทั้งหมด
   */
  async getAllTables(): Promise<string[]> {
    try {
      const result = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
      return result.map((row) => row.table_name)
    } catch (error) {
      console.error("Error getting all tables:", error)
      return []
    }
  }

  /**
   * ประมวลผล SQL query
   */
  async executeQuery(query: string, params: any[] = []): Promise<QueryResult> {
    try {
      // ตรวจสอบ query เพื่อป้องกัน SQL injection
      if (this.isUnsafeQuery(query)) {
        return {
          success: false,
          error: "Unsafe query detected. DROP, TRUNCATE, and system table operations are not allowed.",
        }
      }

      const result = await sql.unsafe(query, ...params)
      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error("Error executing query:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * สร้างตารางใหม่
   */
  async createTable(
    tableName: string,
    columns: { name: string; type: string; nullable: boolean }[],
  ): Promise<QueryResult> {
    try {
      // ตรวจสอบชื่อตารางเพื่อป้องกัน SQL injection
      if (!this.isValidTableName(tableName)) {
        return {
          success: false,
          error: `Invalid table name: ${tableName}`,
        }
      }

      // ตรวจสอบว่าตารางมีอยู่แล้วหรือไม่
      const exists = await this.tableExists(tableName)
      if (exists) {
        return {
          success: false,
          error: `Table ${tableName} already exists`,
        }
      }

      // สร้าง SQL สำหรับสร้างตาราง
      const columnDefinitions = columns
        .map((col) => {
          const nullableStr = col.nullable ? "NULL" : "NOT NULL"
          return `"${col.name}" ${col.type} ${nullableStr}`
        })
        .join(", ")

      const createTableSQL = `CREATE TABLE "${tableName}" (${columnDefinitions})`

      await sql.unsafe(createTableSQL)

      return {
        success: true,
        data: [{ message: `Table ${tableName} created successfully` }],
      }
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * ลบตาราง
   */
  async dropTable(tableName: string): Promise<QueryResult> {
    try {
      // ตรวจสอบชื่อตารางเพื่อป้องกัน SQL injection
      if (!this.isValidTableName(tableName)) {
        return {
          success: false,
          error: `Invalid table name: ${tableName}`,
        }
      }

      // ตรวจสอบว่าตารางมีอยู่หรือไม่
      const exists = await this.tableExists(tableName)
      if (!exists) {
        return {
          success: false,
          error: `Table ${tableName} does not exist`,
        }
      }

      await sql.unsafe(`DROP TABLE "${tableName}"`)

      return {
        success: true,
        data: [{ message: `Table ${tableName} dropped successfully` }],
      }
    } catch (error) {
      console.error(`Error dropping table ${tableName}:`, error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * ตรวจสอบว่าชื่อตารางถูกต้องหรือไม่
   * ป้องกัน SQL injection
   */
  private isValidTableName(tableName: string): boolean {
    // ตรวจสอบว่าชื่อตารางมีเฉพาะตัวอักษร ตัวเลข และ underscore
    return /^[a-zA-Z0-9_]+$/.test(tableName)
  }

  /**
   * ตรวจสอบว่า query ปลอดภัยหรือไม่
   * ป้องกัน SQL injection และการลบข้อมูลโดยไม่ตั้งใจ
   */
  private isUnsafeQuery(query: string): boolean {
    const upperQuery = query.toUpperCase()

    // ตรวจสอบคำสั่งที่อันตราย
    const dangerousKeywords = ["DROP DATABASE", "DROP SCHEMA", "TRUNCATE DATABASE", "INFORMATION_SCHEMA", "PG_"]

    return dangerousKeywords.some((keyword) => upperQuery.includes(keyword))
  }

  /**
   * ดึงข้อมูลสถิติของฐานข้อมูล
   */
  async getDatabaseStats(): Promise<any> {
    try {
      const tables = await this.getAllTables()
      const tableStats = []

      for (const table of tables) {
        const structure = await this.getTableStructure(table)
        if (structure) {
          tableStats.push({
            name: table,
            rowCount: structure.rowCount,
            columnCount: structure.columns.length,
          })
        }
      }

      return {
        tableCount: tables.length,
        tables: tableStats,
      }
    } catch (error) {
      console.error("Error getting database stats:", error)
      return {
        tableCount: 0,
        tables: [],
      }
    }
  }
}

// สร้าง singleton instance และ export
export const databaseService = new DatabaseService()

