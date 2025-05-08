import { NextResponse } from "next/server"
import { getNamespaces } from "@/lib/services/external-rag-service"

export async function GET() {
  try {
    // Forward the request to the external RAG API
    const result = await getNamespaces()

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error listing namespaces:", error)
    return NextResponse.json({ error: error.message || "Failed to list namespaces" }, { status: 500 })
  }
}
