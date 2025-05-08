import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { queryText, queryId } = await request.json()

    if (!queryText) {
      return NextResponse.json({ error: "Query text is required" }, { status: 400 })
    }

    // Execute the query
    const startTime = Date.now()
    const results = await sql.unsafe(queryText)
    const executionTime = (Date.now() - startTime) / 1000 // in seconds

    // If this is a saved query, update its execution stats
    if (queryId) {
      await sql`
        UPDATE saved_queries
        SET 
          last_executed_at = CURRENT_TIMESTAMP,
          execution_count = execution_count + 1
        WHERE id = ${queryId}
      `
    }

    // Log the query execution
    await sql`
      INSERT INTO system_logs (log_id, service, level, message, details)
      VALUES (
        ${"QRY-" + Math.floor(Math.random() * 10000)},
        ${"Query Execution"},
        ${"info"},
        ${`Query executed in ${executionTime.toFixed(3)} seconds`},
        ${JSON.stringify({
          queryId: queryId || null,
          executionTime,
          rowCount: results.length,
        })}
      )
    `

    return NextResponse.json({
      results,
      metadata: {
        rowCount: results.length,
        executionTime,
        columns: results.length > 0 ? Object.keys(results[0]) : [],
      },
    })
  } catch (error: any) {
    console.error("Error executing query:", error)

    // Log the error
    await sql`
      INSERT INTO system_logs (log_id, service, level, message, details)
      VALUES (
        ${"QRY-" + Math.floor(Math.random() * 10000)},
        ${"Query Execution"},
        ${"error"},
        ${`Query execution failed: ${error.message}`},
        ${JSON.stringify({ error: error.message })}
      )
    `

    return NextResponse.json({ error: "Failed to execute query", message: error.message }, { status: 500 })
  }
}
