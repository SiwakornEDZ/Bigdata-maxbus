import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataSourcesTable } from "@/components/data-sources-table"
import { StorageOverview } from "@/components/storage-overview"
import { ReportsTable } from "@/components/reports-table"

export const metadata: Metadata = {
  title: "Data Management",
  description: "Manage your data sources, storage, and reports",
}

export default function DataManagementPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="text-muted-foreground">Manage your data sources, storage, and reports</p>
      </div>

      <Tabs defaultValue="data-sources">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="data-sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>Manage your data sources and connections</CardDescription>
            </CardHeader>
            <CardContent>
              <DataSourcesTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage</CardTitle>
              <CardDescription>Manage your storage and monitor usage</CardDescription>
            </CardHeader>
            <CardContent>
              <StorageOverview />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Manage your reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

