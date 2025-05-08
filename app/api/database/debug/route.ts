import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get database version
    const versionResult = await sql`SELECT version();`
    const version = versionResult[0]?.version || "Unknown"

    // Get database tables
    const tablesResult = await sql`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) AS column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `

    // Get database size
    const sizeResult = await sql`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size;
    `
    const size = sizeResult[0]?.size || "Unknown"

    // Get connection info
    const connectionResult = await sql`
      SELECT current_database() as database, 
             current_user as user,
             inet_server_addr() as server_addr,
             inet_server_port() as server_port;
    `
    const connection = connectionResult[0] || {}

    // Get recent errors from system_logs
    const errorsResult = await sql`
      SELECT * FROM system_logs 
      WHERE level = 'error' 
      ORDER BY created_at DESC 
      LIMIT 10;
    `

    return NextResponse.json({
      version,
      tables: tablesResult,
      size,
      connection,
      errors: errorsResult,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error getting database debug info:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get database debug info",
      },
      { status: 500 },
    )
  }
}
