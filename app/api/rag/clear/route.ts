import { type NextRequest, NextResponse } from "next/server"
import { clearNamespace } from "@/lib/services/external-rag-service"

export async function POST(request: NextRequest) {
  try {
    const { namespace = "default" } = await request.json()

    // Forward the request to the external RAG API
    const result = await clearNamespace(namespace)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error clearing namespace:", error)
    return NextResponse.json({ error: error.message || "Failed to clear namespace" }, { status: 500 })
  }
}
