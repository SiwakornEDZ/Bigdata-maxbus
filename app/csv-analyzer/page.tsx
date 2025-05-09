import { Suspense } from "react"
import { CSVAnalyzer } from "@/components/csv-analyzer"

export default function CSVAnalyzerPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">CSV Analyzer</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <CSVAnalyzer />
      </Suspense>
    </div>
  )
}

