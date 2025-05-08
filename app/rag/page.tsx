import { RagInterface } from "@/components/rag-interface"

export const metadata = {
  title: "RAG System",
  description: "Retrieval-Augmented Generation for document search and question answering",
}

export default function RagPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">RAG System</h1>
      <RagInterface />
    </div>
  )
}
