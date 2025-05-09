import { NextResponse } from "next/server"
import { getAllTables } from "@/lib/db"

export async function GET() {
  try {
    const result = await getAllTables()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error getting tables:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error getting tables",
      },
      { status: 500 },
    )
  }
}
