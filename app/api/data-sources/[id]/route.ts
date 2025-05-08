import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

interface DataSource {
  id: string
  name: string
  type: string
  connection_details: Record<string, any>
  status: string
  created_at: string
  updated_at: string
}

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const id = params.id

    const result = await sql`
      SELECT * FROM data_sources WHERE id = ${id}
    `

    const dataSources = result.rows as DataSource[]

    if (dataSources.length === 0) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json(dataSources[0])
  } catch (error) {
    console.error("Error fetching data source:", error)
    return NextResponse.json({ error: "Failed to fetch data source" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params): Promise<NextResponse> {
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

    const updatedSources = result.rows as DataSource[]

    if (updatedSources.length === 0) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json(updatedSources[0])
  } catch (error) {
    console.error("Error updating data source:", error)
    return NextResponse.json({ error: "Failed to update data source" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
  try {
    const id = params.id

    const result = await sql`
      DELETE FROM data_sources
      WHERE id = ${id}
      RETURNING id
    `

    const deletedSources = result.rows as Pick<DataSource, "id">[]

    if (deletedSources.length === 0) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting data source:", error)
    return NextResponse.json({ error: "Failed to delete data source" }, { status: 500 })
  }
}
