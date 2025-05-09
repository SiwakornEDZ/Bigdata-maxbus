import { NextResponse } from "next/server"
import { externalRagService } from "@/lib/services/external-rag-service"

export async function GET() {
  try {
    const namespaces = await externalRagService.getNamespaces()

    return NextResponse.json(namespaces)
  } catch (error) {
    console.error("Error fetching namespaces:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch namespaces" }, { status: 500 })
  }
}
