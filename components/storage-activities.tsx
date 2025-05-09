"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface StorageActivity {
  id: number
  action: string
  resource: string
  size: string
  user: string
  timestamp: string
}

export function StorageActivities() {
  const [activities, setActivities] = useState<StorageActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/storage/activities")

      if (!response.ok) {
        throw new Error("Failed to fetch storage activities")
      }

      const data = await response.json()
      setActivities(data)
    } catch (error) {
      console.error("Error fetching storage activities:", error)
      toast({
        title: "Error",
        description: "Failed to load storage activities",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "upload":
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case "download":
        return <ArrowDown className="h-4 w-4 text-blue-500" />
      case "delete":
        return <Trash2 className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getActionBadge = (action: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline"

    switch (action.toLowerCase()) {
      case "upload":
        variant = "default"
        break
      case "download":
        variant = "secondary"
        break
      case "delete":
        variant = "destructive"
        break
    }

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getActionIcon(action)}
        <span>{action}</span>
      </Badge>
    )
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
        <p className="text-center text-muted-foreground">No activities found</p>
      </div>
    )
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell>{getActionBadge(activity.action)}</TableCell>
              <TableCell className="font-medium">{activity.resource}</TableCell>
              <TableCell>{activity.size}</TableCell>
              <TableCell>{activity.user}</TableCell>
              <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

