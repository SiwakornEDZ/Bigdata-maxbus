import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const dataSources = await sql`
      SELECT * FROM data_sources ORDER BY name
    `
    return NextResponse.json(dataSources)
  } catch (error) {
    console.error("Error fetching data sources:", error)
    return NextResponse.json({ error: "Failed to fetch data sources" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, type, connection_string, description, created_by } = body

    if (!name || !type || !connection_string) {
      return NextResponse.json({ error: "Name, type, and connection string are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO data_sources (name, type, connection_string, description, created_by, status)
      VALUES (${name}, ${type}, ${connection_string}, ${description || null}, ${created_by || "system"}, 'active')
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating data source:", error)
    return NextResponse.json({ error: "Failed to create data source" }, { status: 500 })
  }
}
