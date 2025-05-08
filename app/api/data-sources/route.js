import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// แปลงไฟล์ route.ts เป็น route.js เพื่อความสอดคล้อง
export async function GET() {
  try {
    const result = await sql`SELECT * FROM data_sources ORDER BY created_at DESC`
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching data sources:", error)
    return NextResponse.json({ error: "Failed to fetch data sources" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, type, connection_details, status } = body

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO data_sources (name, type, connection_details, status)
      VALUES (${name}, ${type}, ${JSON.stringify(connection_details)}, ${status || "active"})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating data source:", error)
    return NextResponse.json({ error: "Failed to create data source" }, { status: 500 })
  }
}
