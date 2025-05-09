import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsOverview } from "@/components/analytics-overview"
import { AnalyticsUsage } from "@/components/analytics-usage"
import { AnalyticsPerformance } from "@/components/analytics-performance"
import { AnalyticsUserActivities } from "@/components/analytics-user-activities"

export const metadata: Metadata = {
  title: "Analytics",
  description: "View system analytics and usage statistics",
}

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">View system analytics and usage statistics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Key metrics and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyticsOverview />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>System usage over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <AnalyticsUsage />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>System performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <AnalyticsPerformance />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Activities</CardTitle>
          <CardDescription>Distribution of user activities</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <AnalyticsUserActivities />
        </CardContent>
      </Card>
    </div>
  )
}

