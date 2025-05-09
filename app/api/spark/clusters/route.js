import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock data for Spark clusters
    const clusters = [
      {
        id: "cluster-1",
        name: "Production Analytics",
        status: "running",
        workers: 5,
        cores: 20,
        memory: 80,
        uptime: 172800, // 48 hours in seconds
        cost: 240.5,
      },
      {
        id: "cluster-2",
        name: "ML Training",
        status: "running",
        workers: 8,
        cores: 64,
        memory: 256,
        uptime: 86400, // 24 hours in seconds
        cost: 384.75,
      },
      {
        id: "cluster-3",
        name: "Development",
        status: "stopped",
        workers: 2,
        cores: 8,
        memory: 32,
        uptime: 0,
        cost: 0,
      },
      {
        id: "cluster-4",
        name: "Data Processing",
        status: "starting",
        workers: 4,
        cores: 16,
        memory: 64,
        uptime: 300, // 5 minutes in seconds
        cost: 0.42,
      },
      {
        id: "cluster-5",
        name: "Batch Jobs",
        status: "running",
        workers: 3,
        cores: 12,
        memory: 48,
        uptime: 43200, // 12 hours in seconds
        cost: 72.36,
      },
    ]

    return NextResponse.json(clusters)
  } catch (error) {
    console.error("Error fetching Spark clusters:", error)
    return NextResponse.json({ error: "Failed to fetch Spark clusters" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name, workers, cores, memory } = await request.json()

    if (!name || !workers || !cores || !memory) {
      return NextResponse.json({ error: "Name, workers, cores, and memory are required" }, { status: 400 })
    }

    // Mock creating a new cluster
    const newCluster = {
      id: `cluster-${Date.now()}`,
      name,
      status: "starting",
      workers,
      cores: workers * cores,
      memory: workers * memory,
      uptime: 0,
      cost: 0,
    }

    return NextResponse.json(newCluster)
  } catch (error) {
    console.error("Error creating Spark cluster:", error)
    return NextResponse.json({ error: "Failed to create Spark cluster" }, { status: 500 })
  }
}
