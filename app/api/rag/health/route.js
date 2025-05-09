import { NextResponse } from "next/server"
import { externalRagService } from "@/lib/services/external-rag-service"

export async function GET() {
  try {
    const health = await externalRagService.checkHealth()

    return NextResponse.json(health)
  } catch (error) {
    console.error("Error checking RAG service health:", error)
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 })
  }
}
