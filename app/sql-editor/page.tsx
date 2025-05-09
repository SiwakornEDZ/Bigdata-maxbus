import { DashboardLayout } from "@/components/dashboard-layout"
import { SqlEditor } from "@/components/sql-editor"
import { FileText, Database } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SqlEditorPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold tracking-tight">SQL Editor</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/csv-analyzer">
                <FileText className="h-4 w-4 mr-2" />
                CSV Analyzer
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/table-checker">
                <Database className="h-4 w-4 mr-2" />
                Table Checker
              </a>
            </Button>
          </div>
        </div>

        <SqlEditor />
      </div>
    </DashboardLayout>
  )
}

