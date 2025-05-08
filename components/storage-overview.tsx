"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HardDrive } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface StorageData {
  totalSpace: number
  usedSpace: number
  availableSpace: number
  usagePercentage: number
}

export function StorageOverview() {
  const [storageData, setStorageData] = useState<StorageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStorageData()
  }, [])

  const fetchStorageData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/storage")

      if (!response.ok) {
        throw new Error("Failed to fetch storage data")
      }

      const data = await response.json()
      setStorageData(data)
    } catch (error) {
      console.error("Error fetching storage data:", error)
      toast({
        title: "Error",
        description: "Failed to load storage data",
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

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!storageData) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-center text-muted-foreground">No storage data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <HardDrive className="mb-2 h-8 w-8 text-primary" />
            <h3 className="text-lg font-medium">Total Storage</h3>
            <p className="text-3xl font-bold">{formatBytes(storageData.totalSpace)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <span className="text-lg font-bold text-primary">{storageData.usagePercentage}%</span>
            </div>
            <h3 className="text-lg font-medium">Used Storage</h3>
            <p className="text-3xl font-bold">{formatBytes(storageData.usedSpace)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Storage Usage</span>
          <span className="text-sm text-muted-foreground">
            {formatBytes(storageData.usedSpace)} of {formatBytes(storageData.totalSpace)}
          </span>
        </div>
        <Progress value={storageData.usagePercentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Used: {storageData.usagePercentage}%</span>
          <span>Available: {formatBytes(storageData.availableSpace)}</span>
        </div>
      </div>
    </div>
  )
}
