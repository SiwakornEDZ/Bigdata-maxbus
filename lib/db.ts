import { neon } from "@neondatabase/serverless"

// สร้าง SQL client จาก connection string
const createSqlClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not defined")
    throw new Error("DATABASE_URL is not configured")
  }

  try {
    // สร้าง SQL client จาก connection string
    return neon(process.env.DATABASE_URL)
  } catch (error) {
    console.error("Failed to initialize database connection:", error)
    throw new Error(`Failed to initialize database connection: ${error.message}`)
  }
}

// Export SQL client with error handling
let sql
try {
  sql = createSqlClient()
} catch (error) {
  console.error("Error initializing SQL client:", error)
  // Create a dummy SQL function that throws an error when called
  sql = async () => {
    throw new Error("Database connection not initialized")
  }
  // Add the unsafe method to maintain API compatibility
  sql.unsafe = async () => {
    throw new Error("Database connection not initialized")
  }
}

export { sql }

// ฟังก์ชันตรวจสอบว่าตารางมีอยู่หรือไม่
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      );
    `
    return result[0]?.exists || false
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}

// ฟังก์ชันดึงรายชื่อตารางทั้งหมด
export async function getAllTables(): Promise<string[]> {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `
    return tables.map((t) => t.table_name)
  } catch (error) {
    console.error("Error getting all tables:", error)
    return []
  }
}

// ฟังก์ชันดึงโครงสร้างตาราง
export async function getTableSchema(tableName: string) {
  try {
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
      ORDER BY ordinal_position;
    `
    return columns
  } catch (error) {
    console.error(`Error getting schema for table ${tableName}:`, error)
    return []
  }
}

// ฟังก์ชันแปลงขนาดไฟล์
export const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// ฟังก์ชันทดสอบการเชื่อมต่อฐานข้อมูล
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    return { connected: result[0]?.test === 1, error: null }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return { connected: false, error: error.message }
  }
}

