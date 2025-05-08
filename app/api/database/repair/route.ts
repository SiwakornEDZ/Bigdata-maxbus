import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { importId } = await request.json()

    if (!importId) {
      return NextResponse.json({ error: "Import ID is required" }, { status: 400 })
    }

    // Get the import job details
    const importJobs = await sql`
      SELECT * FROM import_jobs WHERE id = ${importId} AND created_by = ${user.email}
    `

    if (!importJobs || importJobs.length === 0) {
      return NextResponse.json({ error: "Import job not found" }, { status: 404 })
    }

    const importJob = importJobs[0]
    const tableName = importJob.table_name

    if (!tableName) {
      return NextResponse.json({ error: "Table name not found in import job" }, { status: 400 })
    }

    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      );
    `

    if (tableExists[0]?.exists) {
      return NextResponse.json({
        tableExists: true,
        message: `Table ${tableName} already exists`,
        tableName,
      })
    }

    // Table doesn't exist, attempt to recreate it
    // First, create a simple table with a single column
    try {
      await sql.unsafe(`
        CREATE TABLE "${tableName}" (
          id SERIAL PRIMARY KEY,
          data TEXT
        )
      `)

      // Update the import job status
      await sql`
        UPDATE import_jobs
        SET status = ${"repaired"},
            error_message = ${"Table recreated with basic structure"},
            completed_at = NOW()
        WHERE id = ${importId}
      `

      return NextResponse.json({
        tableExists: false,
        success: true,
        message: `Table ${tableName} has been recreated with a basic structure`,
        action: "Please reimport your data to populate the table",
        tableName,
      })
    } catch (error) {
      console.error(`Error recreating table ${tableName}:`, error)

      return NextResponse.json(
        {
          tableExists: false,
          success: false,
          message: `Failed to recreate table ${tableName}`,
          error: error instanceof Error ? error.message : "Unknown error",
          tableName,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in table repair:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to repair table",
      },
      { status: 500 },
    )
  }
}
