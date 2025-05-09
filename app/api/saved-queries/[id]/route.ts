import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid query ID" }, { status: 400 })
    }

    // ดึงข้อมูล query
    const result = await sql`
      SELECT 
        id, 
        name, 
        description, 
        query_text as "queryText", 
        category, 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        execution_count as "executionCount", 
        last_executed_at as "lastExecutedAt",
        created_by as "createdBy"
      FROM saved_queries
      WHERE id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 })
    }

    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของ query หรือไม่
    if (result[0].createdBy !== user.email && user.role !== "admin") {
      return NextResponse.json({ error: "You don't have permission to access this query" }, { status: 403 })
    }

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error fetching query:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid query ID" }, { status: 400 })
    }

    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของ query หรือไม่
    const existingQuery = await sql`
      SELECT created_by FROM saved_queries WHERE id = ${id}
    `

    if (existingQuery.length === 0) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 })
    }

    if (existingQuery[0].created_by !== user.email && user.role !== "admin") {
      return NextResponse.json({ error: "You don't have permission to update this query" }, { status: 403 })
    }

    // รับข้อมูลจาก request body
    const { name, description, queryText, category } = await request.json()

    if (!name || !queryText) {
      return NextResponse.json({ error: "Name and query text are required" }, { status: 400 })
    }

    // อัปเดตข้อมูล
    const result = await sql`
      UPDATE saved_queries
      SET 
        name = ${name},
        description = ${description || null},
        query_text = ${queryText},
        category = ${category || "general"},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
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
        ${"SQL query updated"},
        ${JSON.stringify({ user: user.email, queryId: id, queryName: name })}
      )
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error updating query:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid query ID" }, { status: 400 })
    }

    // ตรวจสอบว่าผู้ใช้เป็นเจ้าของ query หรือไม่
    const existingQuery = await sql`
      SELECT created_by, name FROM saved_queries WHERE id = ${id}
    `

    if (existingQuery.length === 0) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 })
    }

    if (existingQuery[0].created_by !== user.email && user.role !== "admin") {
      return NextResponse.json({ error: "You don't have permission to delete this query" }, { status: 403 })
    }

    // ลบข้อมูล
    await sql`DELETE FROM saved_queries WHERE id = ${id}`

    // บันทึกการกระทำลงในประวัติ
    await sql`
      INSERT INTO system_logs (log_id, service, level, message, details)
      VALUES (
        ${"SQL-" + Math.floor(Math.random() * 10000)},
        ${"SQL Editor"},
        ${"info"},
        ${"SQL query deleted"},
        ${JSON.stringify({ user: user.email, queryId: id, queryName: existingQuery[0].name })}
      )
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting query:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

