import { DashboardLayout } from "@/components/dashboard-layout"
import { DataSourcesTable } from "@/components/data-sources-table"
import { Button } from "@/components/ui/button"
import { Plus, Server } from "lucide-react"

export default function DataSourcesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold">Data Sources</h1>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Data Source</span>
          </Button>
        </div>
        <p className="text-muted-foreground">Manage your data sources and connections to external systems.</p>

        <DataSourcesTable />
      </div>
    </DashboardLayout>
  )
}

