import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const dataSources = await sql`
      SELECT * FROM data_sources ORDER BY created_at DESC
    `

    return NextResponse.json(dataSources)
  } catch (error) {
    console.error("Error fetching data sources:", error)
    return NextResponse.json({ error: "Failed to fetch data sources" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, connection_details } = body

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO data_sources (name, type, connection_details, status, last_sync)
      VALUES (${name}, ${type}, ${JSON.stringify(connection_details)}, 'active', NOW())
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating data source:", error)
    return NextResponse.json({ error: "Failed to create data source" }, { status: 500 })
  }
}
