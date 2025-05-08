import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"

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

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 })
    }

    // In a real application, we would fetch this data from Spark
    // For now, we'll return the sample data
    return NextResponse.json({ success: true, clusters: sparkClusters })
  } catch (error) {
    console.error("Get Spark clusters error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching Spark clusters" },
      { status: 500 },
    )
  }
}
