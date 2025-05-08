"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { LineChart } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <LineChart className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">Platform Analytics</h1>
        </div>
        <p className="text-muted-foreground">Analyze platform usage, performance metrics, and user activities.</p>

        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  )
}
