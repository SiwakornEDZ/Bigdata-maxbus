import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const dataSources = await sql`
      SELECT * FROM data_sources WHERE id = ${id}
    `

    if (dataSources.length === 0) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json(dataSources[0])
  } catch (error) {
    console.error("Error fetching data source:", error)
    return NextResponse.json({ error: "Failed to fetch data source" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (result.length === 0) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating data source:", error)
    return NextResponse.json({ error: "Failed to update data source" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const result = await sql`
      DELETE FROM data_sources
      WHERE id = ${id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting data source:", error)
    return NextResponse.json({ error: "Failed to delete data source" }, { status: 500 })
  }
}
