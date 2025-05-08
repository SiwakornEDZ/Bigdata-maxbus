import { type NextRequest, NextResponse } from "next/server"

// ใช้ URL จาก environment variable โดยตรง
const RAG_API_URL = process.env.RAG_API_URL || "https://your-rag-api.onrender.com"

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

    // สร้าง FormData ใหม่เพื่อส่งไปยัง external API
    const newFormData = new FormData()

    for (const file of files) {
      newFormData.append("files", file)
    }

    newFormData.append("namespace", namespace)
    newFormData.append("delete_existing", deleteExisting.toString())

    // ส่งคำขอไปยัง external API
    const response = await fetch(`${RAG_API_URL}/upload`, {
      method: "POST",
      body: newFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.error || "Failed to upload documents" }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error processing upload:", error)
    return NextResponse.json({ error: error.message || "Failed to process upload" }, { status: 500 })
  }
}
