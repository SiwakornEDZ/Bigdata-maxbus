import { NextResponse } from "next/server"
import { tableExists } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tableName = searchParams.get("name")

    if (!tableName) {
      return NextResponse.json({ success: false, error: "Table name is required" }, { status: 400 })
    }

    const exists = await tableExists(tableName)

    return NextResponse.json({ success: true, exists })
  } catch (error) {
    console.error("Error checking if table exists:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error checking if table exists",
      },
      { status: 500 },
    )
  }
}
