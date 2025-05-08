import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// ใช้รูปแบบที่เรียบง่ายที่สุดตามเอกสารของ Next.js
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const result = await sql`SELECT * FROM data_sources WHERE id = ${id}`
    const dataSource = result[0]

    if (!dataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json(dataSource)
  } catch (error) {
    console.error("Error fetching data source:", error)
    return NextResponse.json({ error: "Failed to fetch data source" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  try {
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

    const updatedSource = result[0]

    if (!updatedSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json(updatedSource)
  } catch (error) {
    console.error("Error updating data source:", error)
    return NextResponse.json({ error: "Failed to update data source" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const result = await sql`
      DELETE FROM data_sources
      WHERE id = ${id}
      RETURNING id
    `

    const deletedSource = result[0]

    if (!deletedSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting data source:", error)
    return NextResponse.json({ error: "Failed to delete data source" }, { status: 500 })
  }
}
