"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { toast } from "@/components/ui/use-toast"

interface UserActivity {
  activity: string
  count: number
  color: string
}

export function AnalyticsUserActivities() {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/analytics/users")

      if (!response.ok) {
        throw new Error("Failed to fetch user activities")
      }

      const data = await response.json()
      setActivities(data)
    } catch (error) {
      console.error("Error fetching user activities:", error)
      toast({
        title: "Error",
        description: "Failed to load user activities",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border bg-background p-2 shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">Count: {payload[0].value}</p>
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

  if (activities.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-center text-muted-foreground">No user activities data available</p>
      </div>
    )
  }

  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activities}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
            nameKey="activity"
          >
            {activities.map((entry, index) => (
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

