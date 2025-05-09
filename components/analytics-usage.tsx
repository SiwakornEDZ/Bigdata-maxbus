"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { toast } from "@/components/ui/use-toast"

interface UsageData {
  date: string
  queries: number
  dataProcessed: number
  activeUsers: number
}

export function AnalyticsUsage() {
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUsageData()
  }, [])

  const fetchUsageData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/analytics/usage")

      if (!response.ok) {
        throw new Error("Failed to fetch usage data")
      }

      const data = await response.json()
      setUsageData(data)
    } catch (error) {
      console.error("Error fetching usage data:", error)
      toast({
        title: "Error",
        description: "Failed to load usage data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border bg-background p-2 shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.name === "Data Processed" ? "GB" : ""}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (usageData.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-center text-muted-foreground">No usage data available</p>
      </div>
    )
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={usageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="queries" name="Queries" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line yAxisId="left" type="monotone" dataKey="activeUsers" name="Active Users" stroke="#82ca9d" />
          <Line yAxisId="right" type="monotone" dataKey="dataProcessed" name="Data Processed" stroke="#ffc658" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

