import { Suspense } from "react"
import { TableChecker } from "@/components/table-checker"

export default function TableCheckerPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Table Checker</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <TableChecker />
      </Suspense>
    </div>
  )
}

