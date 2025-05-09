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
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    // ดึงประวัติการรัน SQL จากตาราง system_logs
    const history = await sql`
      SELECT 
        id,
        log_id as "logId",
        message,
        details,
        timestamp
      FROM system_logs
      WHERE 
        service = 'SQL Editor' 
        AND level = 'info' 
        AND message = 'SQL query executed'
        AND details->>'user' = ${user.email}
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `

    return NextResponse.json(history)
  } catch (error: any) {
    console.error("Error fetching SQL history:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

