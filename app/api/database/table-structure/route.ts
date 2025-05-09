import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tableName = searchParams.get("name")

    if (!tableName) {
      return NextResponse.json({ success: false, error: "Table name is required" }, { status: 400 })
    }

    if (!sql) {
      return NextResponse.json({ success: false, error: "Database connection not initialized" }, { status: 500 })
    }

    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
      ORDER BY ordinal_position;
    `

    return NextResponse.json({
      success: true,
      data: {
        name: tableName,
        columns: columns.map((col) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === "YES",
        })),
      },
    })
  } catch (error) {
    console.error("Error getting table structure:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error getting table structure",
      },
      { status: 500 },
    )
  }
}
