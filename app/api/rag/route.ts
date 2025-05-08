import { NextResponse } from "next/server"
import { RAG_API_URL } from "@/lib/services/external-rag-service"

export async function GET() {
  return NextResponse.json({
    name: "RAG API Proxy",
    version: "1.0.0",
    description: "Proxy for the external RAG API hosted on Render",
    externalApiUrl: RAG_API_URL,
    endpoints: [
      {
        path: "/api/rag/upload",
        method: "POST",
        description: "Upload documents to the system",
        parameters: ["files", "namespace", "delete_existing"],
      },
      {
        path: "/api/rag/ask",
        method: "POST",
        description: "Ask questions to the RAG system",
        parameters: ["query", "namespace", "return_sources", "verbose"],
      },
      {
        path: "/api/rag/clear",
        method: "POST",
        description: "Delete all data in the specified namespace",
        parameters: ["namespace"],
      },
      {
        path: "/api/rag/namespaces",
        method: "GET",
        description: "View list of namespaces in the system",
      },
      {
        path: "/api/rag/status",
        method: "GET",
        description: "Check system status",
      },
      {
        path: "/api/rag/health",
        method: "GET",
        description: "Check system operational status",
      },
    ],
  })
}
