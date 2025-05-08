import { NextResponse } from "next/server"
import { checkHealth } from "@/lib/services/external-rag-service"

export async function GET() {
  try {
    // Forward the request to the external RAG API
    const result = await checkHealth()

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
