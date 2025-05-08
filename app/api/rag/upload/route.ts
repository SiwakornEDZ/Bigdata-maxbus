import { type NextRequest, NextResponse } from "next/server"
import { uploadDocuments } from "@/lib/services/external-rag-service"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract files from the form data
    const files = formData.getAll("files") as File[]
    const namespace = formData.get("namespace")?.toString() || "default"
    const deleteExisting = formData.get("delete_existing") === "true"

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    // Forward the request to the external RAG API
    const result = await uploadDocuments(files, namespace, deleteExisting)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error processing upload:", error)
    return NextResponse.json({ error: error.message || "Failed to process upload" }, { status: 500 })
  }
}
