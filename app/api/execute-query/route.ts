import { NextResponse } from "next/server"
import { executeQueryFormatted } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { query, params = [] } = await request.json()

    if (!query) {
      return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 })
    }

    const result = await executeQueryFormatted(query, params)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ success: false, error: result.error || "Failed to execute query" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in execute query route:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
