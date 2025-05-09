"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalQueries: number
    totalDataSources: number
    totalStorage: string
  }
  usageData: {
    date: string
    queries: number
    dataProcessed: number
    activeUsers: number
  }[]
  performanceData: {
    date: string
    responseTime: number
    cpuUsage: number
    memoryUsage: number
  }[]
  userActivities: {
    activity: string
    count: number
    color: string
  }[]
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const overviewResponse = await fetch("/api/analytics/overview")
        const usageResponse = await fetch("/api/analytics/usage")
        const performanceResponse = await fetch("/api/analytics/performance")
        const userActivitiesResponse = await fetch("/api/analytics/users")

        if (!overviewResponse.ok || !usageResponse.ok || !performanceResponse.ok || !userActivitiesResponse.ok) {
          throw new Error("Failed to fetch analytics data")
        }

        const overview = await overviewResponse.json()
        const usageData = await usageResponse.json()
        const performanceData = await performanceResponse.json()
        const userActivities = await userActivitiesResponse.json()

        setAnalyticsData({
          overview,
          usageData,
          performanceData,
          userActivities,
        })
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{analyticsData?.overview.totalUsers}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{analyticsData?.overview.activeUsers}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{analyticsData?.overview.totalQueries}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <div className="text-2xl font-bold">{analyticsData?.overview.totalStorage}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage">
        <TabsList>
          <TabsTrigger value="usage">Platform Usage</TabsTrigger>
          <TabsTrigger value="performance">System Performance</TabsTrigger>
          <TabsTrigger value="users">User Activities</TabsTrigger>
        </TabsList>
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Platform Usage Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[350px] w-full animate-pulse bg-muted/50 rounded-md" />
              ) : analyticsData?.usageData ? (
                <ChartContainer
                  config={{
                    queries: {
                      label: "Queries",
                      color: "hsl(var(--chart-1))",
                    },
                    dataProcessed: {
                      label: "Data Processed (GB)",
                      color: "hsl(var(--chart-2))",
                    },
                    activeUsers: {
                      label: "Active Users",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[350px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="queries" stroke="var(--color-queries)" strokeWidth={2} />
                      <Line
                        type="monotone"
                        dataKey="dataProcessed"
                        stroke="var(--color-dataProcessed)"
                        strokeWidth={2}
                      />
                      <Line type="monotone" dataKey="activeUsers" stroke="var(--color-activeUsers)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-[350px] items-center justify-center">
                  <p className="text-muted-foreground">No usage data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[350px] w-full animate-pulse bg-muted/50 rounded-md" />
              ) : analyticsData?.performanceData ? (
                <ChartContainer
                  config={{
                    responseTime: {
                      label: "Response Time (ms)",
                      color: "hsl(var(--chart-1))",
                    },
                    cpuUsage: {
                      label: "CPU Usage (%)",
                      color: "hsl(var(--chart-2))",
                    },
                    memoryUsage: {
                      label: "Memory Usage (%)",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-[350px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="responseTime" fill="var(--color-responseTime)" />
                      <Bar dataKey="cpuUsage" fill="var(--color-cpuUsage)" />
                      <Bar dataKey="memoryUsage" fill="var(--color-memoryUsage)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-[350px] items-center justify-center">
                  <p className="text-muted-foreground">No performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[350px] w-full animate-pulse bg-muted/50 rounded-md" />
              ) : analyticsData?.userActivities ? (
                <ChartContainer
                  config={analyticsData.userActivities.reduce(
                    (acc, item) => {
                      acc[item.activity] = {
                        label: item.activity,
                        color: item.color,
                      }
                      return acc
                    },
                    {} as Record<string, { label: string; color: string }>,
                  )}
                  className="h-[350px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.userActivities}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="activity"
                      >
                        {analyticsData.userActivities.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-[350px] items-center justify-center">
                  <p className="text-muted-foreground">No user activity data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

