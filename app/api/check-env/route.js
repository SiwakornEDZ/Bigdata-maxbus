import { NextResponse } from "next/server"
import { testConnection, getAllTables } from "@/lib/db"

export async function GET() {
  try {
    // ตรวจสอบว่ามี environment variables ที่จำเป็นหรือไม่
    const envVars = {
      DATABASE_URL: process.env && process.env.DATABASE_URL ? "set" : "not set",
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV || "development",
      // เพิ่ม environment variables อื่นๆ ที่ต้องการตรวจสอบ
    }

    let databaseConnected = false
    let databaseError = null
    let databaseTables = []

    // ทดสอบการเชื่อมต่อฐานข้อมูลเฉพาะเมื่อมี DATABASE_URL
    if (envVars.DATABASE_URL === "set") {
      try {
        const connectionTest = await testConnection()
        databaseConnected = connectionTest.connected
        databaseError = connectionTest.error

        if (databaseConnected) {
          databaseTables = await getAllTables()
        }
      } catch (dbError) {
        console.error("Database test error:", dbError)
        databaseError = dbError.message
      }
    } else {
      databaseError = "DATABASE_URL environment variable is not set"
    }

    return NextResponse.json({
      envVars,
      databaseConnected,
      databaseError,
      databaseTables,
    })
  } catch (error) {
    console.error("Error checking environment:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to check environment",
      },
      { status: 500 },
    )
  }
}
