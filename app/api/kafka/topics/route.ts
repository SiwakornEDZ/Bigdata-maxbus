import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"

// Sample data for Kafka topics
const kafkaTopics = [
  {
    name: "user-events",
    partitions: 12,
    replicationFactor: 3,
    messagesPerSec: 8500,
    retentionHours: 72,
    sizeGB: 256,
    status: "active",
  },
  {
    name: "transactions",
    partitions: 24,
    replicationFactor: 3,
    messagesPerSec: 5200,
    retentionHours: 168,
    sizeGB: 512,
    status: "active",
  },
  {
    name: "clickstream",
    partitions: 48,
    replicationFactor: 3,
    messagesPerSec: 12000,
    retentionHours: 48,
    sizeGB: 384,
    status: "active",
  },
  {
    name: "sensor-data",
    partitions: 36,
    replicationFactor: 3,
    messagesPerSec: 3800,
    retentionHours: 72,
    sizeGB: 128,
    status: "active",
  },
  {
    name: "notifications",
    partitions: 6,
    replicationFactor: 3,
    messagesPerSec: 950,
    retentionHours: 24,
    sizeGB: 64,
    status: "active",
  },
  {
    name: "logs",
    partitions: 24,
    replicationFactor: 3,
    messagesPerSec: 7500,
    retentionHours: 48,
    sizeGB: 320,
    status: "active",
  },
  {
    name: "metrics",
    partitions: 12,
    replicationFactor: 3,
    messagesPerSec: 2200,
    retentionHours: 72,
    sizeGB: 96,
    status: "active",
  },
  {
    name: "alerts",
    partitions: 6,
    replicationFactor: 3,
    messagesPerSec: 120,
    retentionHours: 168,
    sizeGB: 32,
    status: "active",
  },
  {
    name: "audit-trail",
    partitions: 12,
    replicationFactor: 3,
    messagesPerSec: 850,
    retentionHours: 720,
    sizeGB: 192,
    status: "active",
  },
  {
    name: "errors",
    partitions: 6,
    replicationFactor: 3,
    messagesPerSec: 75,
    retentionHours: 168,
    sizeGB: 48,
    status: "active",
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

    // In a real application, we would fetch this data from Kafka
    // For now, we'll return the sample data
    return NextResponse.json({ success: true, topics: kafkaTopics })
  } catch (error) {
    console.error("Get Kafka topics error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching Kafka topics" },
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

    const { name, partitions, replicationFactor, retentionHours } = await request.json()

    if (!name || !partitions || !replicationFactor || !retentionHours) {
      return NextResponse.json(
        { success: false, message: "Name, partitions, replication factor, and retention hours are required" },
        { status: 400 },
      )
    }

    // In a real application, we would create the topic in Kafka
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      topic: {
        name,
        partitions,
        replicationFactor,
        messagesPerSec: 0,
        retentionHours,
        sizeGB: 0,
        status: "active",
      },
    })
  } catch (error) {
    console.error("Create Kafka topic error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while creating Kafka topic" },
      { status: 500 },
    )
  }
}

