import { NextResponse } from "next/server"
import { externalRagService } from "@/lib/services/external-rag-service"

export async function POST(request) {
  try {
    const { query, namespace = "default" } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const result = await externalRagService.askQuestion(query, namespace)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error asking question:", error)
    return NextResponse.json({ error: error.message || "Failed to process question" }, { status: 500 })
  }
}
