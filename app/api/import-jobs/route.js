import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    let query = sql`
      SELECT 
        ij.id, 
        ij.filename, 
        ij.status, 
        ij.records_count, 
        ij.created_at, 
        ij.updated_at,
        ij.file_size,
        ij.file_type,
        ij.error_message,
        u.username as created_by
      FROM import_jobs ij
      LEFT JOIN users u ON ij.user_id = u.id
      WHERE 1=1
    `

    if (status && status !== "all") {
      query = sql`${query} AND ij.status = ${status}`
    }

    query = sql`${query} ORDER BY ij.created_at DESC LIMIT ${limit}`

    const jobs = await query

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching import jobs:", error)
    return NextResponse.json({ error: "Failed to fetch import jobs" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { filename, fileSize, fileType } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    // Get user ID
    const userResult = await sql`
      SELECT id FROM users WHERE email = ${user.email}
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = userResult[0].id

    // Create import job
    const result = await sql`
      INSERT INTO import_jobs (
        filename, 
        status, 
        user_id,
        file_size,
        file_type
      )
      VALUES (
        ${filename}, 
        ${"pending"}, 
        ${userId},
        ${fileSize || 0},
        ${fileType || null}
      )
      RETURNING 
        id, 
        filename, 
        status, 
        created_at, 
        updated_at
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating import job:", error)
    return NextResponse.json({ error: "Failed to create import job" }, { status: 500 })
  }
}
