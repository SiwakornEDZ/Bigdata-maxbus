import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Collect environment variables status
    const envVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,
    }

    // Check for missing variables
    const missingVars = Object.entries(envVars)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name)

    // Default values
    let databaseConnected = false
    let databaseError = null
    let databaseTables = []

    // Only try database operations if DATABASE_URL exists
    if (process.env.DATABASE_URL) {
      try {
        // Import database module safely
        const db = await import("@/lib/db")

        // Test connection with a simple query that doesn't actually hit the database
        databaseConnected = true

        try {
          // Now try a real database query
          const result = await db.sql`SELECT 1 as test`
          databaseConnected = result[0]?.test === 1

          if (databaseConnected) {
            // Get list of tables if connected
            try {
              const tables = await db.sql`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
              `
              databaseTables = tables.map((t) => t.table_name)
            } catch (tableError) {
              console.error("Error fetching tables:", tableError)
              // Still consider connected even if table fetch fails
            }
          }
        } catch (queryError) {
          console.error("Database query error:", queryError)
          databaseConnected = false
          databaseError = queryError.message || "Failed to execute database query"
        }
      } catch (error) {
        console.error("Database connection error in check-env:", error)
        databaseError = `Error connecting to database: ${error.message || "Unknown error"}`
        databaseConnected = false
      }
    } else {
      databaseError = "DATABASE_URL is not defined"
    }

    // Return successful response with environment info
    return NextResponse.json(
      {
        success: true,
        environment: process.env.NODE_ENV || "development",
        envVars,
        missingVars,
        databaseConnected,
        databaseError,
        databaseTables,
      },
      { status: 200 },
    )
  } catch (error) {
    // Log the error and return a structured error response
    console.error("Error in check-env API route:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check environment",
        error: error.message || "Unknown error",
      },
      { status: 200 }, // Return 200 even for errors to avoid triggering fetch error handling
    )
  }
}

