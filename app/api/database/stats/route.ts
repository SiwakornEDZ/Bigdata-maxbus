import { NextResponse } from "next/server"
import { sql, formatBytes } from "@/lib/db"

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ success: false, error: "Database connection not initialized" }, { status: 500 })
    }

    // Get table count
    const tableCountResult = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `
    const tableCount = Number.parseInt(tableCountResult[0].count)

    // Get table sizes
    const tableSizes = await sql`
      SELECT
        t.table_name as name,
        pg_table_size(quote_ident(t.table_name)::regclass) as size,
        (SELECT reltuples FROM pg_class WHERE relname = t.table_name) as row_count
      FROM information_schema.tables t
      WHERE t.table_schema = 'public'
      ORDER BY size DESC;
    `

    // Calculate total size
    let totalSize = 0
    const tables = tableSizes.map((table) => {
      totalSize += Number.parseInt(table.size)
      return {
        name: table.name,
        rowCount: Math.round(Number.parseFloat(table.row_count)),
        size: formatBytes(Number.parseInt(table.size)),
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        tableCount,
        totalSize: formatBytes(totalSize),
        tables,
      },
    })
  } catch (error) {
    console.error("Error getting database stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error getting database stats",
      },
      { status: 500 },
    )
  }
}
