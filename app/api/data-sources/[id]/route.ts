import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

// ลบ interface DataSource ที่ไม่จำเป็นออก

// แก้ไขฟังก์ชัน GET ให้มีลายเซ็นที่ถูกต้องตามที่ Next.js คาดหวัง
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const result = await sql`
      SELECT * FROM data_sources WHERE id = ${id}
    `

    const dataSources = result.rows || result

    if (!dataSources || dataSources.length === 0) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json(dataSources[0])
  } catch (error) {
    console.error("Error fetching data source:", error)
    return NextResponse.json({ error: "Failed to fetch data source" }, { status: 500 })
  }
}

// แก้ไขฟังก์ชัน PUT ให้มีลายเซ็นที่ถูกต้องตามที่ Next.js คาดหวัง
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

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

    const updatedSources = result.rows || result

    if (!updatedSources || updatedSources.length === 0) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json(updatedSources[0])
  } catch (error) {
    console.error("Error updating data source:", error)
    return NextResponse.json({ error: "Failed to update data source" }, { status: 500 })
  }
}

// แก้ไขฟังก์ชัน DELETE ให้มีลายเซ็นที่ถูกต้องตามที่ Next.js คาดหวัง
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM data_sources
      WHERE id = ${id}
      RETURNING id
    `

    const deletedSources = result.rows || result

    if (!deletedSources || deletedSources.length === 0) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting data source:", error)
    return NextResponse.json({ error: "Failed to delete data source" }, { status: 500 })
  }
}
