import { NextResponse } from "next/server"

// ใช้ URL จาก environment variable โดยตรง
const RAG_API_URL = process.env.RAG_API_URL || "https://your-rag-api.onrender.com"

export async function GET() {
  try {
    // ส่งคำขอไปยัง external API
    const response = await fetch(`${RAG_API_URL}/health`)

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        {
          status: "unhealthy",
          error: errorData.error || "Health check failed",
        },
        { status: response.status },
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error.message || "Health check failed",
      },
      { status: 500 },
    )
  }
}
