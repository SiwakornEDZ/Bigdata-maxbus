"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pause, Play } from "lucide-react"

// Sample event types and their corresponding colors
const eventTypes = {
  "user-events": "bg-blue-100 text-blue-800",
  transactions: "bg-green-100 text-green-800",
  clickstream: "bg-purple-100 text-purple-800",
  "sensor-data": "bg-yellow-100 text-yellow-800",
  notifications: "bg-pink-100 text-pink-800",
  logs: "bg-gray-100 text-gray-800",
  metrics: "bg-indigo-100 text-indigo-800",
  alerts: "bg-red-100 text-red-800",
  errors: "bg-orange-100 text-orange-800",
}

// Sample event data generators
const generateEvent = () => {
  const topics = Object.keys(eventTypes)
  const topic = topics[Math.floor(Math.random() * topics.length)]

  let payload = ""

  switch (topic) {
    case "user-events":
      payload = `{"user_id": "${Math.floor(Math.random() * 10000)}", "event": "${["login", "logout", "signup", "profile_update"][Math.floor(Math.random() * 4)]}", "timestamp": "${new Date().toISOString()}"}`
      break
    case "transactions":
      payload = `{"txn_id": "T-${Math.floor(Math.random() * 100000)}", "amount": ${(Math.random() * 1000).toFixed(2)}, "status": "${["completed", "pending", "failed"][Math.floor(Math.random() * 3)]}"}`
      break
    case "clickstream":
      payload = `{"session_id": "S-${Math.floor(Math.random() * 10000)}", "page": "/${["home", "products", "about", "contact", "checkout"][Math.floor(Math.random() * 5)]}", "referrer": "${["google.com", "facebook.com", "twitter.com", "direct"][Math.floor(Math.random() * 4)]}"}`
      break
    case "sensor-data":
      payload = `{"device_id": "D-${Math.floor(Math.random() * 1000)}", "temperature": ${(Math.random() * 50).toFixed(1)}, "humidity": ${(Math.random() * 100).toFixed(1)}, "battery": ${(Math.random() * 100).toFixed(0)}}`
      break
    case "alerts":
      payload = `{"alert_id": "A-${Math.floor(Math.random() * 1000)}", "severity": "${["critical", "high", "medium", "low"][Math.floor(Math.random() * 4)]}", "message": "${["System overload", "Disk space low", "Memory usage high", "Network latency"][Math.floor(Math.random() * 4)]}"}`
      break
    default:
      payload = `{"id": "${Math.floor(Math.random() * 10000)}", "message": "Sample event data", "timestamp": "${new Date().toISOString()}"}`
  }

  return {
    id: Math.random().toString(36).substring(2, 15),
    topic,
    partition: Math.floor(Math.random() * 12),
    offset: Math.floor(Math.random() * 1000000),
    timestamp: new Date().toISOString(),
    payload,
  }
}

export function StreamingEventsTable() {
  const [events, setEvents] = useState<ReturnType<typeof generateEvent>[]>([])
  const [isStreaming, setIsStreaming] = useState(true)
  const [maxEvents, setMaxEvents] = useState(100)

  useEffect(() => {
    if (!isStreaming) return

    // Add new events at random intervals
    const interval = setInterval(
      () => {
        const newEvent = generateEvent()

        setEvents((prevEvents) => {
          const updatedEvents = [newEvent, ...prevEvents]
          // Keep only the most recent events
          return updatedEvents.slice(0, maxEvents)
        })
      },
      800 + Math.random() * 1200,
    ) // Random interval between 0.8-2 seconds

    return () => clearInterval(interval)
  }, [isStreaming, maxEvents])

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Showing real-time events from Kafka topics</div>
        <Button variant="outline" size="sm" onClick={toggleStreaming} className="flex items-center gap-2">
          {isStreaming ? (
            <>
              <Pause className="h-4 w-4" />
              <span>Pause Stream</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Resume Stream</span>
            </>
          )}
        </Button>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[120px]">Topic</TableHead>
                <TableHead className="w-[80px]">Partition</TableHead>
                <TableHead className="w-[100px]">Offset</TableHead>
                <TableHead>Payload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-mono text-xs">{new Date(event.timestamp).toLocaleTimeString()}</TableCell>
                  <TableCell>
                    <Badge className={eventTypes[event.topic as keyof typeof eventTypes]}>{event.topic}</Badge>
                  </TableCell>
                  <TableCell>{event.partition}</TableCell>
                  <TableCell>{event.offset.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[400px]">{event.payload}</TableCell>
                </TableRow>
              ))}
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    {isStreaming ? "Waiting for events..." : "Streaming paused. Click Resume to see events."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

