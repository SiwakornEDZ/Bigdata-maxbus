import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataSourcesTable } from "@/components/data-sources-table"

export const metadata: Metadata = {
  title: "Data Sources",
  description: "Manage your data sources and connections",
}

export default function DataSourcesPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
        <p className="text-muted-foreground">Manage your data sources and connections</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>View and manage all your data source connections</CardDescription>
        </CardHeader>
        <CardContent>
          <DataSourcesTable />
        </CardContent>
      </Card>
    </div>
  )
}
