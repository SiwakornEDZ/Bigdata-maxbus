import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportsTable } from "@/components/reports-table"

export const metadata: Metadata = {
  title: "Reports",
  description: "Manage your reports and analytics",
}

export default function ReportsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Manage your reports and analytics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>View and manage all your reports</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsTable />
        </CardContent>
      </Card>
    </div>
  )
}

