"use client"

import { useEffect, useState } from "react"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Sample data for stream processors
const initialProcessors = [
  {
    name: "User Activity Processor",
    status: "running",
    progress: 78,
    metrics: {
      eventsProcessed: 12500000,
      throughput: 8500,
      lag: 120,
    },
  },
  {
    name: "Transaction Enrichment",
    status: "running",
    progress: 92,
    metrics: {
      eventsProcessed: 5800000,
      throughput: 5200,
      lag: 85,
    },
  },
  {
    name: "Anomaly Detection",
    status: "running",
    progress: 65,
    metrics: {
      eventsProcessed: 3200000,
      throughput: 3800,
      lag: 210,
    },
  },
  {
    name: "Clickstream Analytics",
    status: "failed",
    progress: 45,
    metrics: {
      eventsProcessed: 8900000,
      throughput: 0,
      lag: 12500,
    },
  },
]

export function StreamProcessorStatus() {
  const [processors, setProcessors] = useState(initialProcessors)

  useEffect(() => {
    // Simulate real-time updates to processor status
    const interval = setInterval(() => {
      setProcessors((prevProcessors) =>
        prevProcessors.map((processor) => {
          if (processor.status === "failed") return processor

          // Randomly update metrics
          const updatedMetrics = {
            eventsProcessed: processor.metrics.eventsProcessed + Math.floor(Math.random() * 50000),
            throughput: processor.metrics.throughput + (Math.random() * 200 - 100), // Fluctuate by ±100
            lag: Math.max(0, processor.metrics.lag + (Math.random() * 60 - 30)), // Fluctuate by ±30
          }

          // Occasionally change progress
          const updatedProgress = Math.min(100, processor.progress + (Math.random() < 0.3 ? Math.random() * 5 : 0))

          return {
            ...processor,
            progress: updatedProgress,
            metrics: updatedMetrics,
          }
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

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
      {processors.map((processor) => (
        <div key={processor.name} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">{processor.name}</div>
            <div className="flex items-center gap-2">
              {getStatusIcon(processor.status)}
              <span className="text-sm capitalize">{processor.status}</span>
            </div>
          </div>
          <Progress value={processor.progress} className="h-2" />
          <div className="grid grid-cols-3 text-xs text-muted-foreground">
            <div className="flex flex-col">
              <span>Events Processed</span>
              <span className="font-medium text-foreground">{processor.metrics.eventsProcessed.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span>Throughput</span>
              <span className="font-medium text-foreground">
                {Math.round(processor.metrics.throughput).toLocaleString()} msg/s
              </span>
            </div>
            <div className="flex flex-col">
              <span>Consumer Lag</span>
              <span className={`font-medium ${processor.metrics.lag > 1000 ? "text-amber-500" : "text-foreground"}`}>
                {Math.round(processor.metrics.lag).toLocaleString()} msgs
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

