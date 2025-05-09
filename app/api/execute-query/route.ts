import { NextResponse } from "next/server"
import { executeQueryFormatted } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { query, params = [] } = await request.json()

    if (!query) {
      return NextResponse.json({ success: false, error: "Query is required" }, { status: 400 })
    }

    const result = await executeQueryFormatted(query, params)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error executing query:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error executing query",
      },
      { status: 500 },
    )
  }
}
