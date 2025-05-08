import { type NextRequest, NextResponse } from "next/server"
import { askQuestion } from "@/lib/services/external-rag-service"

export async function POST(request: NextRequest) {
  try {
    const { query, namespace = "default", return_sources = false, verbose = false } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 })
    }

    // Forward the request to the external RAG API
    const result = await askQuestion(query, namespace, return_sources, verbose)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error processing query:", error)
    return NextResponse.json({ error: error.message || "Failed to process query" }, { status: 500 })
  }
}
