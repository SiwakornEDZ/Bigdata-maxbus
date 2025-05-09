import { NextResponse } from "next/server"
import { testConnection, getAllTables } from "@/lib/db"

export async function GET() {
  try {
    // Check for required environment variables
    const requiredEnvVars = ["DATABASE_URL"]
    const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])

    // Check database connection if DATABASE_URL is available
    let databaseConnected = false
    let databaseTables = []

    if (!missingEnvVars.includes("DATABASE_URL")) {
      const connectionResult = await testConnection()
      databaseConnected = connectionResult.connected

      if (databaseConnected) {
        const tablesResult = await getAllTables()
        if (tablesResult.tables) {
          databaseTables = tablesResult.tables
        }
      }
    }

    return NextResponse.json({
      databaseConnected,
      databaseTables,
      missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : null,
    })
  } catch (error) {
    console.error("Error checking environment:", error)
    return NextResponse.json(
      { error: `Error checking environment: ${error.message || "Unknown error"}` },
      { status: 500 },
    )
  }
}
