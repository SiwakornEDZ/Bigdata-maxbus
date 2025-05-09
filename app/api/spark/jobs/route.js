import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock data for Spark jobs
    const jobs = [
      {
        id: "job-1",
        name: "Daily User Analytics",
        status: "completed",
        duration: 245,
        startTime: "2023-05-10T08:00:00Z",
        endTime: "2023-05-10T08:04:05Z",
        clusterId: "cluster-1",
        user: "data-engineer",
      },
      {
        id: "job-2",
        name: "Product Recommendations",
        status: "running",
        duration: 180,
        startTime: "2023-05-10T09:30:00Z",
        endTime: null,
        clusterId: "cluster-2",
        user: "data-scientist",
      },
      {
        id: "job-3",
        name: "Log Processing",
        status: "failed",
        duration: 75,
        startTime: "2023-05-10T07:15:00Z",
        endTime: "2023-05-10T07:16:15Z",
        clusterId: "cluster-1",
        user: "system",
        error: "Out of memory error",
      },
      {
        id: "job-4",
        name: "Data Transformation",
        status: "queued",
        duration: null,
        startTime: null,
        endTime: null,
        clusterId: "cluster-3",
        user: "data-engineer",
      },
      {
        id: "job-5",
        name: "Monthly Report Generation",
        status: "completed",
        duration: 540,
        startTime: "2023-05-01T00:00:00Z",
        endTime: "2023-05-01T00:09:00Z",
        clusterId: "cluster-2",
        user: "reporting",
      },
    ]

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching Spark jobs:", error)
    return NextResponse.json({ error: "Failed to fetch Spark jobs" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name, clusterId, config } = await request.json()

    if (!name || !clusterId) {
      return NextResponse.json({ error: "Name and clusterId are required" }, { status: 400 })
    }

    // Mock submitting a new job
    const newJob = {
      id: `job-${Date.now()}`,
      name,
      status: "queued",
      duration: null,
      startTime: null,
      endTime: null,
      clusterId,
      user: "current-user",
      config: config || {},
    }

    return NextResponse.json(newJob)
  } catch (error) {
    console.error("Error submitting Spark job:", error)
    return NextResponse.json({ error: "Failed to submit Spark job" }, { status: 500 })
  }
}
