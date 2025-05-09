import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request) {
  try {
    const { tableName, action } = await request.json()

    if (!tableName || !action) {
      return NextResponse.json({ error: "Table name and action are required" }, { status: 400 })
    }

    let result

    switch (action) {
      case "vacuum":
        // VACUUM cannot run inside a transaction block
        await sql.unsafe(`VACUUM ANALYZE ${tableName}`)
        result = { message: `VACUUM ANALYZE completed for ${tableName}` }
        break

      case "reindex":
        await sql.unsafe(`REINDEX TABLE ${tableName}`)
        result = { message: `REINDEX completed for ${tableName}` }
        break

      case "analyze":
        await sql.unsafe(`ANALYZE ${tableName}`)
        result = { message: `ANALYZE completed for ${tableName}` }
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error repairing table:", error)
    return NextResponse.json({ error: `Failed to repair table: ${error.message}` }, { status: 500 })
  }
}
