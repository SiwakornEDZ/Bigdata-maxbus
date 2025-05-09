import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataImportForm } from "@/components/data-import-form"
import { ImportHistory } from "@/components/import-history"
import { DataSourceConnector } from "@/components/data-source-connector"

export default function ImportPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Import</h1>
          <p className="text-muted-foreground">Import data from various sources into your data platform</p>
        </div>

        <Tabs defaultValue="import" className="space-y-4">
          <TabsList>
            <TabsTrigger value="import">Import Configuration</TabsTrigger>
            <TabsTrigger value="history">Import History</TabsTrigger>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
          </TabsList>
          <TabsContent value="import" className="space-y-4">
            <DataImportForm />
          </TabsContent>
          <TabsContent value="history">
            <ImportHistory />
          </TabsContent>
          <TabsContent value="sources">
            <DataSourceConnector />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

