import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request) {
  try {
    const { tableName } = await request.json()

    if (!tableName) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 })
    }

    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      ) as exists
    `

    if (!tableExists[0].exists) {
      return NextResponse.json({ exists: false })
    }

    // Get table structure
    const columns = await sql`
      SELECT 
        column_name, 
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
      ORDER BY ordinal_position
    `

    // Get row count
    const rowCount = await sql`
      SELECT COUNT(*) as count FROM ${sql(tableName)}
    `

    return NextResponse.json({
      exists: true,
      columns,
      rowCount: rowCount[0].count,
    })
  } catch (error) {
    console.error("Error checking table:", error)
    return NextResponse.json({ error: "Failed to check table" }, { status: 500 })
  }
}
