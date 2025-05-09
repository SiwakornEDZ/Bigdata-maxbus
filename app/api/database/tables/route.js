import { NextResponse } from "next/server"
import { databaseService } from "@/lib/services/database-service"

export async function GET() {
  try {
    const tables = await databaseService.getAllTables()

    // สร้างข้อมูลเพิ่มเติมสำหรับแต่ละตาราง
    const tablesWithDetails = await Promise.all(
      tables.map(async (tableName) => {
        const structure = await databaseService.getTableStructure(tableName)
        return {
          table_name: tableName,
          column_count: structure?.columns.length || 0,
          table_size: 0, // ค่าเริ่มต้น
        }
      }),
    )

    return NextResponse.json(tablesWithDetails)
  } catch (error) {
    console.error("Error fetching tables:", error)
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { tableName } = await request.json()

    if (!tableName) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 })
    }

    const result = await databaseService.dropTable(tableName)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: `Table ${tableName} deleted successfully` })
  } catch (error) {
    console.error("Error deleting table:", error)
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 })
  }
}
