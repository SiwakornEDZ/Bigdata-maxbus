import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// สร้าง route ใหม่ที่มีโครงสร้างแตกต่างออกไป
export async function GET(request, { params }) {
  try {
    const id = params.id

    const result = await sql`SELECT * FROM data_sources WHERE id = ${id}`

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching data source:", error)
    return NextResponse.json({ error: "Failed to fetch data source" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const id = params.id
    const body = await request.json()
    const { name, type, connection_details, status } = body

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE data_sources
      SET 
        name = ${name},
        type = ${type},
        connection_details = ${JSON.stringify(connection_details)},
        status = ${status},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating data source:", error)
    return NextResponse.json({ error: "Failed to update data source" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = params.id

    const result = await sql`
      DELETE FROM data_sources
      WHERE id = ${id}
      RETURNING id
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting data source:", error)
    return NextResponse.json({ error: "Failed to delete data source" }, { status: 500 })
  }
}
