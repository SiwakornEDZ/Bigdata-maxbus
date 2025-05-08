"use client"

import { CheckCircle, Clock, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Sample data for processing status
const processingStatus = [
  {
    cluster: "Production Cluster",
    status: "running",
    progress: 78,
    jobs: {
      completed: 342,
      running: 56,
      failed: 3,
    },
  },
  {
    cluster: "Analytics Cluster",
    status: "running",
    progress: 92,
    jobs: {
      completed: 128,
      running: 12,
      failed: 0,
    },
  },
  {
    cluster: "Development Cluster",
    status: "running",
    progress: 45,
    jobs: {
      completed: 67,
      running: 89,
      failed: 5,
    },
  },
]

export function DataProcessingStatus() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {processingStatus.map((cluster) => (
        <div key={cluster.cluster} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">{cluster.cluster}</div>
            <div className="flex items-center gap-2">
              {getStatusIcon(cluster.status)}
              <span className="text-sm capitalize">{cluster.status}</span>
            </div>
          </div>
          <Progress value={cluster.progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>{cluster.jobs.completed} completed</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-500" />
              <span>{cluster.jobs.running} running</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>{cluster.jobs.failed} failed</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
