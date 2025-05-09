"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, Clock, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type SystemLog = {
  id: number
  log_id: string
  timestamp: string
  service: string
  message: string
  level: string
  details?: any
}

export function DataTable() {
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortColumn, setSortColumn] = useState("timestamp")
  const [sortDirection, setSortDirection] = useState("desc")
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/system-logs")

      if (!response.ok) {
        throw new Error("Failed to fetch system logs")
      }

      const data = await response.json()
      setLogs(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching system logs:", err)
      setError("Failed to load system logs. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()

    // Poll for updates every 10 seconds
    const intervalId = setInterval(fetchLogs, 10000)

    return () => clearInterval(intervalId)
  }, [])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredData = Array.isArray(logs)
    ? logs.filter((item) => {
        if (!item || typeof item !== "object") return false
        return Object.values(item).some((value) => {
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      })
    : []

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortColumn as keyof SystemLog]
    const bValue = b[sortColumn as keyof SystemLog]

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "info":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  if (isLoading && logs.length === 0) {
    return <div className="flex justify-center p-4">Loading system logs...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
        <Button onClick={fetchLogs} variant="outline" className="mt-2">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" size="icon" onClick={fetchLogs}>
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground">No system logs found.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("log_id")}
                    className="flex items-center gap-1 p-0 font-medium"
                  >
                    ID
                    {sortColumn === "log_id" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("timestamp")}
                    className="flex items-center gap-1 p-0 font-medium"
                  >
                    Timestamp
                    {sortColumn === "timestamp" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("service")}
                    className="flex items-center gap-1 p-0 font-medium"
                  >
                    Service
                    {sortColumn === "service" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-[150px]">Level</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.log_id}</TableCell>
                  <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                  <TableCell>{log.service}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getLevelIcon(log.level)}
                      <span className="capitalize">{log.level}</span>
                    </div>
                  </TableCell>
                  <TableCell>{log.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

