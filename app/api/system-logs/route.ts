import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const level = searchParams.get("level")
    const service = searchParams.get("service")

    let query = sql`
      SELECT * FROM system_logs
    `

    const conditions = []
    const params = []

    if (level) {
      conditions.push(`level = $${params.length + 1}`)
      params.push(level)
    }

    if (service) {
      conditions.push(`service = $${params.length + 1}`)
      params.push(service)
    }

    if (conditions.length > 0) {
      query = sql.unsafe(
        `
        SELECT * FROM system_logs
        WHERE ${conditions.join(" AND ")}
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `,
        ...params,
      )
    } else {
      query = sql.unsafe(`
        SELECT * FROM system_logs
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `)
    }

    const logs = await query

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching system logs:", error)
    return NextResponse.json({ error: "Failed to fetch system logs" }, { status: 500 })
  }
}

