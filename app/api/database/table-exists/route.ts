import { type NextRequest, NextResponse } from "next/server"
import { databaseService } from "@/lib/services/database-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tableName = searchParams.get("table")

    if (!tableName) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 })
    }

    const exists = await databaseService.tableExists(tableName)

    return NextResponse.json({ exists })
  } catch (error) {
    console.error("Error checking if table exists:", error)
    return NextResponse.json({ error: "Failed to check if table exists" }, { status: 500 })
  }
}

