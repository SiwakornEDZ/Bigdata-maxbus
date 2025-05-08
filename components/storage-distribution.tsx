"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { toast } from "@/components/ui/use-toast"

interface StorageDistributionItem {
  name: string
  value: number
  color: string
}

export function StorageDistribution() {
  const [distribution, setDistribution] = useState<StorageDistributionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDistribution()
  }, [])

  const fetchDistribution = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/storage/distribution")

      if (!response.ok) {
        throw new Error("Failed to fetch storage distribution")
      }

      const data = await response.json()
      setDistribution(data)
    } catch (error) {
      console.error("Error fetching storage distribution:", error)
      toast({
        title: "Error",
        description: "Failed to load storage distribution",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border bg-background p-2 shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">{formatBytes(payload[0].value)}</p>
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

  if (distribution.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-center text-muted-foreground">No distribution data available</p>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={distribution} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
            {distribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
