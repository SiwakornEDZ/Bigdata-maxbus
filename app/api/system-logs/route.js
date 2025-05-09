import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const service = searchParams.get("service")
    const level = searchParams.get("level")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    let query = sql`
      SELECT 
        log_id, 
        timestamp, 
        service, 
        level, 
        message, 
        details
      FROM system_logs
      WHERE 1=1
    `

    if (service) {
      query = sql`${query} AND service = ${service}`
    }

    if (level) {
      query = sql`${query} AND level = ${level}`
    }

    query = sql`${query} ORDER BY timestamp DESC LIMIT ${limit}`

    const logs = await query

    return NextResponse.json(logs)
  } catch (error) {
    console.error("Error fetching system logs:", error)
    return NextResponse.json({ error: "Failed to fetch system logs" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { service, level, message, details } = await request.json()

    if (!service || !level || !message) {
      return NextResponse.json({ error: "Service, level, and message are required" }, { status: 400 })
    }

    const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const result = await sql`
      INSERT INTO system_logs (log_id, service, level, message, details)
      VALUES (${logId}, ${service}, ${level}, ${message}, ${JSON.stringify(details || {})})
      RETURNING log_id, timestamp, service, level, message, details
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating system log:", error)
    return NextResponse.json({ error: "Failed to create system log" }, { status: 500 })
  }
}
