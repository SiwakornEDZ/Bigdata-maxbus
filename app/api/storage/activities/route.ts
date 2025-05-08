import { sql } from "@/lib/db"
import { formatBytes } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const activities = await sql`
      SELECT sa.id, sa.action, sa.resource, sa.size, u.name as user, sa.created_at as timestamp
      FROM storage_activities sa
      LEFT JOIN users u ON sa.user_id = u.id
      ORDER BY sa.created_at DESC
      LIMIT 10
    `

    // Format the size
    const formattedActivities = activities.map((activity: any) => ({
      ...activity,
      size: formatBytes(Number(activity.size)),
    }))

    return NextResponse.json(formattedActivities)
  } catch (error) {
    console.error("Error fetching storage activities:", error)
    return NextResponse.json({ error: "Failed to fetch storage activities" }, { status: 500 })
  }
}
