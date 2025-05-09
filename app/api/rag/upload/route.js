import { NextResponse } from "next/server"
import { externalRagService } from "@/lib/services/external-rag-service"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const namespace = formData.get("namespace") || "default"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Get file metadata
    const filename = file.name
    const contentType = file.type

    // Upload to RAG service
    const result = await externalRagService.uploadDocument(buffer, filename, contentType, namespace)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error uploading document:", error)
    return NextResponse.json({ error: error.message || "Failed to upload document" }, { status: 500 })
  }
}
