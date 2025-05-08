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

    // ดึงข้อมูลรายงานตาม ID
    const report = await sql`
      SELECT * FROM reports WHERE id = ${params.id}
    `

    if (report.length === 0) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // ตรวจสอบว่ารายงานพร้อมให้ดาวน์โหลดหรือไม่
    if (report[0].status !== "completed") {
      return NextResponse.json({ error: "Report is not ready for download" }, { status: 400 })
    }

    // ตรวจสอบว่ามีไฟล์รายงานหรือไม่
    if (!report[0].file_path) {
      return NextResponse.json({ error: "Report file not found" }, { status: 404 })
    }

    // บันทึกการกระทำลงในประวัติ
    await sql`
      INSERT INTO system_logs (log_id, service, level, message, details)
      VALUES (
        ${"RPT-" + Math.floor(Math.random() * 10000)},
        ${"Reports"},
        ${"info"},
        ${`Report downloaded: ${report[0].name}`},
        ${JSON.stringify({ user: user.email, reportId: params.id })}
      )
    `

    // ในสภาพแวดล้อมจริง คุณจะส่งไฟล์กลับไปให้ผู้ใช้
    // แต่สำหรับตัวอย่างนี้ เราจะส่งข้อความกลับไป
    return NextResponse.json({
      success: true,
      message: `Report ${report[0].name} is ready for download`,
      reportUrl: report[0].file_path,
    })
  } catch (error: any) {
    console.error("Error downloading report:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
