import { NextResponse } from "next/server"
import { externalRagService } from "@/lib/services/external-rag-service"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const namespace = searchParams.get("namespace") || "default"

    const status = await externalRagService.getNamespaceStatus(namespace)

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error fetching namespace status:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch namespace status" }, { status: 500 })
  }
}
