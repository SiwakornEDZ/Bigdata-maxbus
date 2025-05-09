import { NextResponse } from "next/server"
import { sql } from "../../../lib/db"

export async function GET() {
  try {
    const result = await sql`SELECT 1 as test`
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Database connection failed:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

