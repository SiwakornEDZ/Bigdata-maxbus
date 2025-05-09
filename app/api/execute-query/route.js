import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { query, params = [] } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Execute the query
    const startTime = Date.now()
    const result = await sql.unsafe(query, ...params)
    const executionTime = Date.now() - startTime

    // Log the query
    await sql`
      INSERT INTO system_logs (log_id, service, level, message, details)
      VALUES (
        ${"SQL-" + Math.floor(Math.random() * 10000)},
        ${"SQL Editor"},
        ${"info"},
        ${"SQL query executed"},
        ${JSON.stringify({ user: user.email, executionTime })}
      )
    `

    return NextResponse.json({
      result,
      executionTime,
      rowCount: result.length,
    })
  } catch (error) {
    console.error("Error executing query:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
