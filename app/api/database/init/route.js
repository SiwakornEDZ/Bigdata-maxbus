import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/db"
import { sql } from "@vercel/postgres"
import { tableExists } from "@/lib/db"

export async function POST() {
  try {
    const result = await initializeDatabase()

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Unknown error initializing database" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error initializing database" },
      { status: 500 },
    )
  }
}

// Add a GET method to check if the database is initialized
export async function GET() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ initialized: false, error: "DATABASE_URL not set" }, { status: 200 })
    }

    // Check database connection
    try {
      await sql`SELECT 1`
    } catch (error) {
      return NextResponse.json(
        {
          initialized: false,
          error: `Database connection failed: ${error.message}`,
        },
        { status: 200 },
      )
    }

    // Check if users table exists
    const usersTableExists = await tableExists("users")

    return NextResponse.json(
      {
        initialized: usersTableExists,
        message: usersTableExists ? "Database is initialized" : "Database needs initialization",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error checking database initialization:", error)
    return NextResponse.json(
      {
        initialized: false,
        error: `Error checking database: ${error.message}`,
      },
      { status: 200 },
    )
  }
}
