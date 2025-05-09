import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"

// Sample data for Spark jobs
const sparkJobs = [
  {
    id: "job-1234",
    name: "Customer Data ETL",
    type: "batch",
    status: "running",
    progress: 78,
    startTime: "2025-03-23T08:30:00",
    duration: "01:45:22",
    dataProcessed: "1.2 TB",
    cluster: "prod-cluster-1",
  },
  {
    id: "job-1235",
    name: "Product Catalog Processing",
    type: "batch",
    status: "completed",
    progress: 100,
    startTime: "2025-03-23T06:15:00",
    duration: "00:45:12",
    dataProcessed: "450 GB",
    cluster: "prod-cluster-2",
  },
  {
    id: "job-1236",
    name: "Sales Analytics",
    type: "batch",
    status: "failed",
    progress: 45,
    startTime: "2025-03-23T07:00:00",
    duration: "00:32:18",
    dataProcessed: "320 GB",
    cluster: "prod-cluster-1",
  },
  {
    id: "job-1237",
    name: "User Activity Streaming",
    type: "streaming",
    status: "running",
    progress: 100,
    startTime: "2025-03-22T12:00:00",
    duration: "22:30:45",
    dataProcessed: "850 GB/hr",
    cluster: "stream-cluster-1",
  },
  {
    id: "job-1238",
    name: "Recommendation Engine",
    type: "batch",
    status: "queued",
    progress: 0,
    startTime: "2025-03-23T10:00:00",
    duration: "00:00:00",
    dataProcessed: "0 GB",
    cluster: "ml-cluster-1",
  },
  {
    id: "job-1239",
    name: "Clickstream Analytics",
    type: "streaming",
    status: "running",
    progress: 100,
    startTime: "2025-03-22T18:00:00",
    duration: "16:30:45",
    dataProcessed: "1.1 TB/hr",
    cluster: "stream-cluster-2",
  },
  {
    id: "job-1240",
    name: "Daily Data Warehouse Update",
    type: "batch",
    status: "completed",
    progress: 100,
    startTime: "2025-03-23T01:00:00",
    duration: "03:15:22",
    dataProcessed: "2.8 TB",
    cluster: "prod-cluster-3",
  },
  {
    id: "job-1241",
    name: "Customer Segmentation",
    type: "batch",
    status: "running",
    progress: 35,
    startTime: "2025-03-23T09:15:00",
    duration: "01:15:00",
    dataProcessed: "780 GB",
    cluster: "ml-cluster-1",
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
    return NextResponse.json({ success: true, jobs: sparkJobs })
  } catch (error) {
    console.error("Get Spark jobs error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching Spark jobs" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 })
    }

    const { name, type, cluster } = await request.json()

    if (!name || !type || !cluster) {
      return NextResponse.json({ success: false, message: "Name, type, and cluster are required" }, { status: 400 })
    }

    // Generate a unique job ID
    const jobId = `job-${Math.floor(Math.random() * 10000)}`

    // In a real application, we would create the job in Spark
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      job: {
        id: jobId,
        name,
        type,
        status: "queued",
        progress: 0,
        startTime: new Date().toISOString(),
        duration: "00:00:00",
        dataProcessed: "0 GB",
        cluster,
      },
    })
  } catch (error) {
    console.error("Create Spark job error:", error)
    return NextResponse.json({ success: false, message: "An error occurred while creating Spark job" }, { status: 500 })
  }
}

