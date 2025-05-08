import { type NextRequest, NextResponse } from "next/server"

// ใช้ URL จาก environment variable โดยตรง
const RAG_API_URL = process.env.RAG_API_URL || "https://your-rag-api.onrender.com"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { namespace = "default" } = body

    // ส่งคำขอไปยัง external API
    const response = await fetch(`${RAG_API_URL}/clear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        namespace,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.error || "Failed to clear namespace" }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error clearing namespace:", error)
    return NextResponse.json({ error: error.message || "Failed to clear namespace" }, { status: 500 })
  }
}
