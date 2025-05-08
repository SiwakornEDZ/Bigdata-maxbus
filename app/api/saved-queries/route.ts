import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // ตรวจสอบการยืนยันตัวตน
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ดึงพารามิเตอร์จาก URL query string
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // สร้างคำสั่ง SQL สำหรับดึงข้อมูล
    let query = `
      SELECT 
        id, 
        name, 
        description, 
        query_text as "queryText", 
        category, 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        execution_count as "executionCount", 
        last_executed_at as "lastExecutedAt"
      FROM saved_queries
      WHERE created_by = $1
    `

    const params = [user.email]

    // เพิ่มเงื่อนไขการกรองตามหมวดหมู่ถ้ามีการระบุ
    if (category && category !== "all") {
      query += " AND category = $2"
      params.push(category)
    }

    // เพิ่มการเรียงลำดับและจำกัดจำนวน
    query += " ORDER BY updated_at DESC LIMIT $" + (params.length + 1)
    params.push(limit)

    // ดึงข้อมูล
    try {
      const savedQueries = await sql.unsafe(query, ...params)
      return NextResponse.json(savedQueries)
    } catch (dbError: any) {
      console.error("Database error fetching saved queries:", dbError)
      return NextResponse.json({ error: "Database error: " + dbError.message }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error fetching saved queries:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // ตรวจสอบการยืนยันตัวตน
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // รับข้อมูลจาก request body
    const { name, description, queryText, category = "general" } = await request.json()

    if (!name || !queryText) {
      return NextResponse.json({ error: "Name and query text are required" }, { status: 400 })
    }

    // บันทึกข้อมูล
    const result = await sql`
      INSERT INTO saved_queries (
        name, 
        description, 
        query_text, 
        category,
        created_by
      )
      VALUES (
        ${name}, 
        ${description || null}, 
        ${queryText}, 
        ${category},
        ${user.email}
      )
      RETURNING 
        id, 
        name, 
        description, 
        query_text as "queryText", 
        category, 
        created_at as "createdAt", 
        updated_at as "updatedAt"
    `

    // บันทึกการกระทำลงในประวัติ
    await sql`
      INSERT INTO system_logs (log_id, service, level, message, details)
      VALUES (
        ${"SQL-" + Math.floor(Math.random() * 10000)},
        ${"SQL Editor"},
        ${"info"},
        ${"SQL query saved"},
        ${JSON.stringify({ user: user.email, queryName: name })}
      )
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error saving query:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
