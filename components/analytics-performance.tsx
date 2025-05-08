"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { toast } from "@/components/ui/use-toast"

interface PerformanceData {
  date: string
  responseTime: number
  cpuUsage: number
  memoryUsage: number
}

export function AnalyticsPerformance() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/analytics/performance")

      if (!response.ok) {
        throw new Error("Failed to fetch performance data")
      }

      const data = await response.json()
      setPerformanceData(data)
    } catch (error) {
      console.error("Error fetching performance data:", error)
      toast({
        title: "Error",
        description: "Failed to load performance data",
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
              {entry.name}: {entry.value} {entry.name === "Response Time" ? "ms" : "%"}
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

  if (performanceData.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-center text-muted-foreground">No performance data available</p>
      </div>
    )
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="responseTime" name="Response Time" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="cpuUsage" name="CPU Usage" stroke="#82ca9d" />
          <Line type="monotone" dataKey="memoryUsage" name="Memory Usage" stroke="#ffc658" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
