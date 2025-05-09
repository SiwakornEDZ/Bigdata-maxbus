import { NextResponse } from "next/server"
import { getAllTables } from "@/lib/db"

export async function GET() {
  try {
    const result = await getAllTables()

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ success: false, error: result.error || "Failed to get tables" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in get tables route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
