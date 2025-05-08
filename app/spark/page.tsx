import { BarChart3, Clock, RefreshCw, Settings, FileCode, Database, Server } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SparkJobsTable } from "@/components/spark-jobs-table"
import { SparkClusterStatus } from "@/components/spark-cluster-status"
import { SparkResourceUsage } from "@/components/spark-resource-usage"
import { SparkPipelineDesigner } from "@/components/spark-pipeline-designer"

export default function SparkPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Apache Spark Data Processing</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button size="sm" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              <span>New Job</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+3 from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cluster Utilization</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78%</div>
              <p className="text-xs text-muted-foreground">+12% from last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Processed</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2 TB</div>
              <p className="text-xs text-muted-foreground">Today's total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Job Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.5 min</div>
              <p className="text-xs text-muted-foreground">-2.3 min from last week</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="clusters">Clusters</TabsTrigger>
            <TabsTrigger value="pipelines">Pipeline Designer</TabsTrigger>
            <TabsTrigger value="resources">Resource Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Spark Jobs</CardTitle>
                <CardDescription>Manage and monitor your Spark jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <SparkJobsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clusters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Spark Clusters</CardTitle>
                <CardDescription>Monitor and manage your Spark clusters</CardDescription>
              </CardHeader>
              <CardContent>
                <SparkClusterStatus />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pipelines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Pipeline Designer</CardTitle>
                <CardDescription>Design and deploy Spark data processing pipelines</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <SparkPipelineDesigner />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>Monitor Spark cluster resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <SparkResourceUsage />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
