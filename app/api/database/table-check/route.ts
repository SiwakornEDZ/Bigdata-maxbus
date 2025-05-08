import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get table name from query params
    const { searchParams } = new URL(request.url)
    const tableName = searchParams.get("table")

    if (!tableName) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 })
    }

    // Check if table exists
    const tableExistsResult = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      );
    `
    const tableExists = tableExistsResult[0]?.exists || false

    if (!tableExists) {
      return NextResponse.json({
        exists: false,
        message: `Table '${tableName}' does not exist in the database`,
        suggestion: "The table may have been deleted or not created properly during import",
      })
    }

    // Get table schema
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
      ORDER BY ordinal_position;
    `

    // Get row count
    const countResult = await sql.unsafe(`SELECT COUNT(*) FROM "${tableName}"`)
    const rowCount = Number.parseInt(countResult[0]?.count || "0")

    // Get sample data (first 5 rows)
    let sampleData = []
    if (rowCount > 0) {
      sampleData = await sql.unsafe(`SELECT * FROM "${tableName}" LIMIT 5`)
    }

    // Get table size
    const tableSizeResult = await sql`
      SELECT pg_size_pretty(pg_total_relation_size(${tableName}::regclass)) as size,
             pg_total_relation_size(${tableName}::regclass) as size_bytes
    `
    const tableSize = tableSizeResult[0]?.size || "0 bytes"
    const tableSizeBytes = Number.parseInt(tableSizeResult[0]?.size_bytes || "0")

    return NextResponse.json({
      exists: true,
      name: tableName,
      columns,
      rowCount,
      sampleData,
      tableSize,
      tableSizeBytes,
      message: `Table '${tableName}' exists with ${rowCount} rows and ${columns.length} columns`,
    })
  } catch (error) {
    console.error("Error checking table:", error)
    return NextResponse.json(
      {
        error: "Failed to check table",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
