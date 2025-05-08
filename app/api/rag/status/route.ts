import { NextResponse } from "next/server"

// ใช้ URL จาก environment variable โดยตรง
const RAG_API_URL = process.env.RAG_API_URL || "https://your-rag-api.onrender.com"

export async function GET() {
  try {
    // ส่งคำขอไปยัง external API
    const response = await fetch(`${RAG_API_URL}/status`)

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        {
          status: "error",
          error: errorData.error || "Failed to get status",
        },
        { status: response.status },
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error getting status:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Failed to get status",
      },
      { status: 500 },
    )
  }
}
