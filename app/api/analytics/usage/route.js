import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const usageData = await sql`
      SELECT 
        TO_CHAR(date, 'YYYY-MM-DD') as date,
        queries,
        data_processed / 1073741824 as dataProcessed,
        active_users as activeUsers
      FROM analytics_usage
      ORDER BY date ASC
      LIMIT 30
    `

    return NextResponse.json(usageData)
  } catch (error) {
    console.error("Error fetching analytics usage:", error)
    return NextResponse.json({ error: "Failed to fetch analytics usage" }, { status: 500 })
  }
}
