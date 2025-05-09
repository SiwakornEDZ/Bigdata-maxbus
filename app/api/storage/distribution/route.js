import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const distribution = await sql`
      SELECT name, size, color FROM storage_distribution
    `

    return NextResponse.json(distribution)
  } catch (error) {
    console.error("Error fetching storage distribution:", error)
    return NextResponse.json({ error: "Failed to fetch storage distribution" }, { status: 500 })
  }
}
