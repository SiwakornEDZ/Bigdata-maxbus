import { NextResponse } from "next/server"
import { tableExists } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { tableName } = await request.json()

    if (!tableName) {
      return NextResponse.json({ success: false, error: "Table name is required" }, { status: 400 })
    }

    const exists = await tableExists(tableName)

    return NextResponse.json({ success: true, exists })
  } catch (error) {
    console.error("Error in table exists route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
