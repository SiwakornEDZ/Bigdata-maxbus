import { NextResponse } from "next/server"
import { databaseService } from "@/lib/services/database-service"

export async function GET(request, { params }) {
  try {
    const tableName = params.name

    if (!tableName) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 })
    }

    const structure = await databaseService.getTableStructure(tableName)

    if (!structure) {
      return NextResponse.json({ error: `Table ${tableName} not found` }, { status: 404 })
    }

    return NextResponse.json({
      columns: structure.columns.map((col) => ({
        column_name: col.name,
        data_type: col.type,
        is_nullable: col.nullable ? "YES" : "NO",
      })),
      sampleData: structure.sampleData,
      rowCount: structure.rowCount,
    })
  } catch (error) {
    console.error(`Error fetching table structure for ${params.name}:`, error)
    return NextResponse.json({ error: "Failed to fetch table structure" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const tableName = params.name

    if (!tableName) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 })
    }

    const result = await databaseService.dropTable(tableName)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: `Table ${tableName} deleted successfully` })
  } catch (error) {
    console.error(`Error deleting table ${params.name}:`, error)
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 })
  }
}
