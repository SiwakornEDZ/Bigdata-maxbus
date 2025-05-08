import { DashboardLayout } from "@/components/dashboard-layout"
import { ReportsList } from "@/components/reports-list"
import { Button } from "@/components/ui/button"
import { FileText, Plus } from "lucide-react"

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold">Reports</h1>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Generate Report</span>
          </Button>
        </div>
        <p className="text-muted-foreground">View and generate reports from your enterprise data.</p>

        <ReportsList />
      </div>
    </DashboardLayout>
  )
}
