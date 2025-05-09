import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const userActivities = await sql`
      SELECT activity, count, color FROM analytics_user_activities
    `

    return NextResponse.json(userActivities)
  } catch (error) {
    console.error("Error fetching user activities:", error)
    return NextResponse.json({ error: "Failed to fetch user activities" }, { status: 500 })
  }
}
