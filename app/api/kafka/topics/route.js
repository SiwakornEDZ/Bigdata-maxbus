import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock data for Kafka topics
    const topics = [
      {
        id: "topic-1",
        name: "user-events",
        partitions: 3,
        replicationFactor: 2,
        messageRate: 1250,
        status: "active",
        createdAt: "2023-01-15T08:30:00Z",
      },
      {
        id: "topic-2",
        name: "order-processing",
        partitions: 5,
        replicationFactor: 3,
        messageRate: 850,
        status: "active",
        createdAt: "2023-02-10T14:45:00Z",
      },
      {
        id: "topic-3",
        name: "notifications",
        partitions: 2,
        replicationFactor: 2,
        messageRate: 450,
        status: "active",
        createdAt: "2023-03-05T11:20:00Z",
      },
      {
        id: "topic-4",
        name: "logs-system",
        partitions: 4,
        replicationFactor: 2,
        messageRate: 2100,
        status: "active",
        createdAt: "2023-01-20T09:15:00Z",
      },
      {
        id: "topic-5",
        name: "analytics-events",
        partitions: 6,
        replicationFactor: 3,
        messageRate: 1800,
        status: "active",
        createdAt: "2023-04-12T16:30:00Z",
      },
    ]

    return NextResponse.json(topics)
  } catch (error) {
    console.error("Error fetching Kafka topics:", error)
    return NextResponse.json({ error: "Failed to fetch Kafka topics" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name, partitions, replicationFactor } = await request.json()

    if (!name || !partitions || !replicationFactor) {
      return NextResponse.json({ error: "Name, partitions, and replicationFactor are required" }, { status: 400 })
    }

    // Mock creating a new topic
    const newTopic = {
      id: `topic-${Date.now()}`,
      name,
      partitions,
      replicationFactor,
      messageRate: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(newTopic)
  } catch (error) {
    console.error("Error creating Kafka topic:", error)
    return NextResponse.json({ error: "Failed to create Kafka topic" }, { status: 500 })
  }
}
