import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get system tables (excluding PostgreSQL internal tables)
    const systemTables = await sql`
      SELECT table_name as name, 'system' as type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT IN (
        SELECT table_name 
        FROM import_jobs 
        WHERE status = 'completed'
      )
      ORDER BY table_name
    `

    // Get imported tables
    const importedTables = await sql`
      SELECT table_name as name, 'imported' as type
      FROM import_jobs
      WHERE status = 'completed'
      AND created_by = ${user.email}
      ORDER BY table_name
    `

    // Combine both types of tables
    const tables = [...systemTables, ...importedTables]

    return NextResponse.json(tables)
  } catch (error) {
    console.error("Error fetching database tables:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch database tables",
      },
      { status: 500 },
    )
  }
}
