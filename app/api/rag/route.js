import { NextResponse } from "next/server"
import { externalRagService } from "@/lib/services/external-rag-service"

export async function GET() {
  try {
    const info = await externalRagService.getServiceInfo()

    return NextResponse.json(info)
  } catch (error) {
    console.error("Error fetching RAG service info:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch RAG service info" }, { status: 500 })
  }
}
