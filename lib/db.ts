import { neon } from "@neondatabase/serverless"

// กำหนด type ให้กับ sql function เพื่อแก้ไขปัญหา TypeScript error
const sql = neon(process.env.DATABASE_URL || "")

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
export async function getAllTables() {
  try {
    if (!process.env || !process.env.DATABASE_URL) {
      return []
    }

    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    return result.rows.map((row) => row.table_name)
  } catch (error) {
    console.error("Error getting tables:", error)
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
    if (!process.env || !process.env.DATABASE_URL) {
      return {
        connected: false,
        error: "DATABASE_URL is not defined",
      }
    }

    // ทดสอบการเชื่อมต่อโดยการ query ง่ายๆ
    const result = await sql`SELECT 1 as test`

    return {
      connected: true,
      error: null,
    }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      connected: false,
      error: error.message || "Failed to connect to database",
    }
  }
}
