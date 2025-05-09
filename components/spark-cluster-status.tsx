"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle,
  Clock,
  XCircle,
  Server,
  Cpu,
  MemoryStickIcon as Memory,
  HardDrive,
  RefreshCw,
  Settings,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Sample data for Spark clusters
const sparkClusters = [
  {
    id: "prod-cluster-1",
    name: "Production Cluster 1",
    status: "running",
    workers: 12,
    cores: 96,
    memory: "768 GB",
    storage: "24 TB",
    utilization: {
      cpu: 78,
      memory: 65,
      disk: 42,
    },
    applications: 5,
  },
  {
    id: "prod-cluster-2",
    name: "Production Cluster 2",
    status: "running",
    workers: 8,
    cores: 64,
    memory: "512 GB",
    storage: "16 TB",
    utilization: {
      cpu: 45,
      memory: 52,
      disk: 38,
    },
    applications: 3,
  },
  {
    id: "stream-cluster-1",
    name: "Streaming Cluster 1",
    status: "running",
    workers: 6,
    cores: 48,
    memory: "384 GB",
    storage: "12 TB",
    utilization: {
      cpu: 92,
      memory: 88,
      disk: 65,
    },
    applications: 2,
  },
  {
    id: "ml-cluster-1",
    name: "ML Cluster",
    status: "running",
    workers: 4,
    cores: 64,
    memory: "512 GB",
    storage: "8 TB",
    utilization: {
      cpu: 82,
      memory: 75,
      disk: 45,
    },
    applications: 2,
  },
  {
    id: "dev-cluster-1",
    name: "Development Cluster",
    status: "stopped",
    workers: 4,
    cores: 32,
    memory: "256 GB",
    storage: "8 TB",
    utilization: {
      cpu: 0,
      memory: 0,
      disk: 25,
    },
    applications: 0,
  },
]

export function SparkClusterStatus() {
  const [clusters, setClusters] = useState(sparkClusters)

  useEffect(() => {
    const fetchSparkClusters = async () => {
      try {
        const response = await fetch("/api/spark/clusters")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch spark clusters")
        }

        const data = await response.json()
        if (data.success) {
          setClusters(data.clusters)
        }
      } catch (error) {
        console.error("Error fetching spark clusters:", error)
        // Keep using the sample data as fallback
      }
    }

    fetchSparkClusters()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "starting":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "stopped":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getUtilizationColor = (value: number) => {
    if (value > 90) return "bg-red-500"
    if (value > 70) return "bg-amber-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => {
            const fetchSparkClusters = async () => {
              try {
                const response = await fetch("/api/spark/clusters")

                if (!response.ok) {
                  const errorData = await response.json()
                  throw new Error(errorData.message || "Failed to fetch spark clusters")
                }

                const data = await response.json()
                if (data.success) {
                  setClusters(data.clusters)
                }
              } catch (error) {
                console.error("Error fetching spark clusters:", error)
                // Keep using the sample data as fallback
              }
            }

            fetchSparkClusters()
          }}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Manage Clusters</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {clusters.map((cluster) => (
          <Card key={cluster.id} className={cluster.status === "stopped" ? "opacity-70" : ""}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">{cluster.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {cluster.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(cluster.status)}
                  <span className="text-sm capitalize">{cluster.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{cluster.workers} Workers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{cluster.cores} Cores</span>
                </div>
                <div className="flex items-center gap-2">
                  <Memory className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{cluster.memory} Memory</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{cluster.storage} Storage</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">CPU Utilization</span>
                    <span className="text-sm font-medium">{cluster.utilization.cpu}%</span>
                  </div>
                  <Progress
                    value={cluster.utilization.cpu}
                    className="h-2"
                    indicatorClassName={getUtilizationColor(cluster.utilization.cpu)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Memory Utilization</span>
                    <span className="text-sm font-medium">{cluster.utilization.memory}%</span>
                  </div>
                  <Progress
                    value={cluster.utilization.memory}
                    className="h-2"
                    indicatorClassName={getUtilizationColor(cluster.utilization.memory)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Disk Utilization</span>
                    <span className="text-sm font-medium">{cluster.utilization.disk}%</span>
                  </div>
                  <Progress
                    value={cluster.utilization.disk}
                    className="h-2"
                    indicatorClassName={getUtilizationColor(cluster.utilization.disk)}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-muted-foreground">Running Applications:</span> {cluster.applications}
                </div>
                <Button variant="outline" size="sm" disabled={cluster.status === "stopped"}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

