import { NextResponse } from "next/server"
import { externalRagService } from "@/lib/services/external-rag-service"

export async function POST(request) {
  try {
    const { namespace = "default" } = await request.json()

    const result = await externalRagService.clearNamespace(namespace)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error clearing namespace:", error)
    return NextResponse.json({ error: error.message || "Failed to clear namespace" }, { status: 500 })
  }
}
