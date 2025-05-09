import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    // อัปเดตสถิติการรัน
    const result = await sql`
      UPDATE saved_queries
      SET 
        execution_count = execution_count + 1,
        last_executed_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING 
        id, 
        name, 
        execution_count as "executionCount"
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Query not found" }, { status: 404 })
    }

    // บันทึกการกระทำลงในประวัติ
    await sql`
      INSERT INTO system_logs (log_id, service, level, message, details)
      VALUES (
        ${"SQL-" + Math.floor(Math.random() * 10000)},
        ${"SQL Editor"},
        ${"info"},
        ${"Saved SQL query executed"},
        ${JSON.stringify({
          user: user.email,
          queryId: id,
          queryName: result[0].name,
          executionCount: result[0].executionCount,
        })}
      )
    `

    return NextResponse.json({
      success: true,
      executionCount: result[0].executionCount,
    })
  } catch (error: any) {
    console.error("Error updating query execution stats:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

