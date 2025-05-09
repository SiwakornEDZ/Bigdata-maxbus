"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Database, HardDrive, BarChart } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface AnalyticsOverviewData {
  totalUsers: number
  activeUsers: number
  totalQueries: number
  totalDataSources: number
  totalStorage: string
}

export function AnalyticsOverview() {
  const [overviewData, setOverviewData] = useState<AnalyticsOverviewData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOverviewData()
  }, [])

  const fetchOverviewData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/analytics/overview")

      if (!response.ok) {
        throw new Error("Failed to fetch analytics overview")
      }

      const data = await response.json()
      setOverviewData(data)
    } catch (error) {
      console.error("Error fetching analytics overview:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics overview",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!overviewData) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-center text-muted-foreground">No overview data available</p>
      </div>
    )
  }

  const stats = [
    {
      title: "Total Users",
      value: overviewData.totalUsers,
      icon: <Users className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Active Users",
      value: overviewData.activeUsers,
      icon: <Users className="h-5 w-5 text-green-500" />,
    },
    {
      title: "Total Queries",
      value: overviewData.totalQueries,
      icon: <BarChart className="h-5 w-5 text-purple-500" />,
    },
    {
      title: "Data Sources",
      value: overviewData.totalDataSources,
      icon: <Database className="h-5 w-5 text-orange-500" />,
    },
    {
      title: "Total Storage",
      value: overviewData.totalStorage,
      icon: <HardDrive className="h-5 w-5 text-red-500" />,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="flex flex-col items-center justify-center p-6">
            {stat.icon}
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">{stat.title}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

