import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Get PostgreSQL version
    const versionResult = await sql`SELECT version()`
    const version = versionResult[0].version

    // Get database size
    const sizeResult = await sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `
    const size = sizeResult[0].size

    // Get table count
    const tableCountResult = await sql`
      SELECT count(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    const tableCount = tableCountResult[0].count

    // Get connection info
    const connectionResult = await sql`
      SELECT 
        current_database() as database,
        current_user as user
    `
    const connection = connectionResult[0]

    // Get table information
    const tables = await sql`
      SELECT 
        table_name as name,
        pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC
      LIMIT 10
    `

    return NextResponse.json({
      version,
      size,
      tableCount,
      connection,
      tables,
    })
  } catch (error) {
    console.error("Error getting database debug info:", error)
    return NextResponse.json({ error: "Failed to get database debug info" }, { status: 500 })
  }
}
