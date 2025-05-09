import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StorageOverview } from "@/components/storage-overview"
import { StorageActivities } from "@/components/storage-activities"
import { StorageDistribution } from "@/components/storage-distribution"

export const metadata: Metadata = {
  title: "Storage",
  description: "Manage your storage and monitor usage",
}

export default function StoragePage() {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Storage</h1>
        <p className="text-muted-foreground">Manage your storage and monitor usage</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Storage Overview</CardTitle>
            <CardDescription>Current storage usage and capacity</CardDescription>
          </CardHeader>
          <CardContent>
            <StorageOverview />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Storage Distribution</CardTitle>
            <CardDescription>How your storage is being used</CardDescription>
          </CardHeader>
          <CardContent>
            <StorageDistribution />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Recent storage activities and operations</CardDescription>
        </CardHeader>
        <CardContent>
          <StorageActivities />
        </CardContent>
      </Card>
    </div>
  )
}

