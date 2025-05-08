import { sql } from "./db"

export async function testDatabaseConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    console.log("Database connection successful:", result)
    return { success: true, result }
  } catch (error) {
    console.error("Database connection failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
