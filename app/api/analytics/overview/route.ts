import { sql } from "@/lib/db"
import { formatBytes } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const overview = await sql`
      SELECT * FROM analytics_overview LIMIT 1
    `

    if (overview.length === 0) {
      return NextResponse.json({ error: "No analytics overview found" }, { status: 404 })
    }

    const data = overview[0]

    return NextResponse.json({
      totalUsers: data.total_users,
      activeUsers: data.active_users,
      totalQueries: data.total_queries,
      totalDataSources: data.total_data_sources,
      totalStorage: formatBytes(Number(data.total_storage)),
    })
  } catch (error) {
    console.error("Error fetching analytics overview:", error)
    return NextResponse.json({ error: "Failed to fetch analytics overview" }, { status: 500 })
  }
}
