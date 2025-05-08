import { NextResponse } from "next/server"
import { getStatus } from "@/lib/services/external-rag-service"

export async function GET() {
  try {
    // Forward the request to the external RAG API
    const result = await getStatus()

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
