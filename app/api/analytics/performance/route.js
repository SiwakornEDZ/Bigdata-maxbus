import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const performanceData = await sql`
      SELECT 
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        response_time as responseTime,
        cpu_usage as cpuUsage,
        memory_usage as memoryUsage
      FROM analytics_performance
      ORDER BY date ASC
      LIMIT 30
    `

    return NextResponse.json(performanceData)
  } catch (error) {
    console.error("Error fetching analytics performance:", error)
    return NextResponse.json({ error: "Failed to fetch analytics performance" }, { status: 500 })
  }
}
