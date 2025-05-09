import { NextResponse } from "next/server"
import { databaseService } from "@/lib/services/database-service"

export async function POST(request) {
  try {
    const { query, params } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "SQL query is required" }, { status: 400 })
    }

    const result = await databaseService.executeQuery(query, params || [])

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error executing SQL:", error)
    return NextResponse.json({ error: "Failed to execute SQL" }, { status: 500 })
  }
}
