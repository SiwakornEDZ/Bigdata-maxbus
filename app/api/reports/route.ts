import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")

    let reports

    if (type && type !== "all") {
      reports = await sql`
        SELECT * FROM reports WHERE type = ${type} ORDER BY created_at DESC
      `
    } else {
      reports = await sql`
        SELECT * FROM reports ORDER BY created_at DESC
      `
    }

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, description, created_by, scheduled_for } = body

    if (!name || !type || !created_by) {
      return NextResponse.json({ error: "Name, type, and created_by are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO reports (name, type, description, created_by, status, scheduled_for)
      VALUES (${name}, ${type}, ${description}, ${created_by}, 'scheduled', ${scheduled_for || null})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}
