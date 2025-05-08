import { type NextRequest, NextResponse } from "next/server"

// ใช้ URL จาก environment variable โดยตรง
const RAG_API_URL = process.env.RAG_API_URL || "https://your-rag-api.onrender.com"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, namespace = "default", return_sources = false, verbose = false } = body

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 })
    }

    // ส่งคำขอไปยัง external API
    const response = await fetch(`${RAG_API_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        namespace,
        return_sources,
        verbose,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.error || "Failed to process query" }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error processing query:", error)
    return NextResponse.json({ error: error.message || "Failed to process query" }, { status: 500 })
  }
}
