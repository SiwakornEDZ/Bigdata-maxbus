import { NextResponse } from "next/server"
import { databaseService } from "@/lib/services/database-service"

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tableName = searchParams.get("table")

    if (!tableName) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 })
    }

    const tableInfo = await databaseService.getTableStructure(tableName)

    if (!tableInfo) {
      return NextResponse.json({ error: `Table '${tableName}' does not exist` }, { status: 404 })
    }

    return NextResponse.json(tableInfo)
  } catch (error) {
    console.error("Error getting table structure:", error)
    return NextResponse.json({ error: "Failed to get table structure" }, { status: 500 })
  }
}
