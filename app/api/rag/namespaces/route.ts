import { NextResponse } from "next/server"

// ใช้ URL จาก environment variable โดยตรง
const RAG_API_URL = process.env.RAG_API_URL || "https://your-rag-api.onrender.com"

export async function GET() {
  try {
    // ส่งคำขอไปยัง external API
    const response = await fetch(`${RAG_API_URL}/namespaces`)

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.error || "Failed to list namespaces" }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error listing namespaces:", error)
    return NextResponse.json({ error: error.message || "Failed to list namespaces" }, { status: 500 })
  }
}
