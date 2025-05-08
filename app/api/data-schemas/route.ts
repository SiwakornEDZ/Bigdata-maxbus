import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ตรวจสอบว่าตาราง data_schemas มีอยู่หรือไม่
    try {
      // ดึงข้อมูลจากตาราง data_schemas
      const schemas = await sql`
        SELECT * FROM data_schemas ORDER BY created_at DESC
      `

      console.log("Fetched schemas:", schemas)

      return NextResponse.json(schemas)
    } catch (error) {
      console.error("Error fetching schemas:", error)

      // ถ้าตารางไม่มีอยู่ ให้สร้างตารางและส่งค่าว่างกลับไป
      if (error.message && error.message.includes('relation "data_schemas" does not exist')) {
        try {
          await sql`
            CREATE TABLE IF NOT EXISTS data_schemas (
              id SERIAL PRIMARY KEY,
              table_name TEXT NOT NULL,
              columns JSONB NOT NULL,
              import_id INTEGER,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
          `
          console.log("Created data_schemas table")
          return NextResponse.json([])
        } catch (createError) {
          console.error("Error creating data_schemas table:", createError)
          return NextResponse.json({ error: "Failed to create data schemas table" }, { status: 500 })
        }
      }

      return NextResponse.json({ error: "Failed to fetch data schemas" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in data schemas route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// เพิ่ม endpoint สำหรับสร้างตาราง data_schemas ถ้ายังไม่มี
export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { tableName, columns, importId } = body

    if (!tableName || !columns) {
      return NextResponse.json({ error: "Table name and columns are required" }, { status: 400 })
    }

    // ตรวจสอบว่าตาราง data_schemas มีอยู่หรือไม่
    try {
      await sql`SELECT 1 FROM data_schemas LIMIT 1`
    } catch (error) {
      if (error.message && error.message.includes('relation "data_schemas" does not exist')) {
        await sql`
          CREATE TABLE IF NOT EXISTS data_schemas (
            id SERIAL PRIMARY KEY,
            table_name TEXT NOT NULL,
            columns JSONB NOT NULL,
            import_id INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `
      }
    }

    // ตรวจสอบว่ามีข้อมูลของตารางนี้อยู่แล้วหรือไม่
    const existingSchema = await sql`
      SELECT id FROM data_schemas WHERE table_name = ${tableName}
    `

    if (existingSchema.length > 0) {
      // อัปเดตข้อมูลที่มีอยู่
      const result = await sql`
        UPDATE data_schemas 
        SET columns = ${JSON.stringify(columns)}, import_id = ${importId}
        WHERE table_name = ${tableName}
        RETURNING *
      `
      return NextResponse.json(result[0])
    } else {
      // เพิ่มข้อมูลใหม่
      const result = await sql`
        INSERT INTO data_schemas (table_name, columns, import_id)
        VALUES (${tableName}, ${JSON.stringify(columns)}, ${importId})
        RETURNING *
      `
      return NextResponse.json(result[0])
    }
  } catch (error) {
    console.error("Error creating data schema:", error)
    return NextResponse.json({ error: "Failed to create data schema" }, { status: 500 })
  }
}
