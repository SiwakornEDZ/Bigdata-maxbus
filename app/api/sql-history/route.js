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
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const history = await sql`
      SELECT 
        id, 
        query, 
        executed_at as "executedAt", 
        execution_time as "executionTime", 
        row_count as "rowCount", 
        status
      FROM query_history
      WHERE user_id = (SELECT id FROM users WHERE email = ${user.email})
      ORDER BY executed_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json(history)
  } catch (error) {
    console.error("Error fetching SQL history:", error)
    return NextResponse.json({ error: "Failed to fetch SQL history" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { query, executionTime, rowCount, status } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO query_history (
        query, 
        user_id, 
        execution_time, 
        row_count, 
        status
      )
      VALUES (
        ${query}, 
        (SELECT id FROM users WHERE email = ${user.email}), 
        ${executionTime || null}, 
        ${rowCount || null}, 
        ${status || "completed"}
      )
      RETURNING 
        id, 
        query, 
        executed_at as "executedAt", 
        execution_time as "executionTime", 
        row_count as "rowCount", 
        status
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error saving SQL history:", error)
    return NextResponse.json({ error: "Failed to save SQL history" }, { status: 500 })
  }
}
