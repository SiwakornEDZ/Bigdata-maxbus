import { NextResponse } from "next/server"
import { databaseService } from "@/lib/services/database-service"

export async function GET() {
  try {
    const stats = await databaseService.getDatabaseStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error getting database stats:", error)
    return NextResponse.json({ error: "Failed to get database stats" }, { status: 500 })
  }
}

