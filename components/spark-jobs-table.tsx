"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, BarChart3, Edit, MoreHorizontal, Play, Pause, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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
    submitted_by: "user1",
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
    submitted_by: "user2",
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
    submitted_by: "user1",
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
    submitted_by: "user3",
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
    submitted_by: "user2",
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
    submitted_by: "user3",
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
    submitted_by: "user1",
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
    submitted_by: "user2",
  },
]

export function SparkJobsTable() {
  const [sortColumn, setSortColumn] = useState("startTime")
  const [sortDirection, setSortDirection] = useState("desc")
  const [searchTerm, setSearchTerm] = useState("")

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredJobs = Array.isArray(sparkJobs)
    ? sparkJobs.filter((job) => {
        if (!job || typeof job !== "object") return false
        return (
          job.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.submitted_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (job.type as string)?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    : []

  const sortedData = [...filteredJobs].sort((a, b) => {
    const aValue = a[sortColumn as keyof typeof a]
    const bValue = b[sortColumn as keyof typeof b]

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "queued":
        return <Badge className="bg-yellow-100 text-yellow-800">Queued</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "batch":
        return <Badge variant="outline">Batch</Badge>
      case "streaming":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            Streaming
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          <span>New Job</span>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort("id")}
                  className="flex items-center gap-1 p-0 font-medium"
                >
                  Job ID
                  {sortColumn === "id" ? (
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
                  onClick={() => handleSort("name")}
                  className="flex items-center gap-1 p-0 font-medium"
                >
                  Name
                  {sortColumn === "name" ? (
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
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("startTime")}
                  className="flex items-center gap-1 p-0 font-medium"
                >
                  Start Time
                  {sortColumn === "startTime" ? (
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
              <TableHead>Duration</TableHead>
              <TableHead>Data Processed</TableHead>
              <TableHead>Cluster</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono text-xs">{job.id}</TableCell>
                <TableCell className="font-medium">{job.name}</TableCell>
                <TableCell>{getTypeBadge(job.type)}</TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell>{formatTimestamp(job.startTime)}</TableCell>
                <TableCell>{job.duration}</TableCell>
                <TableCell>{job.dataProcessed}</TableCell>
                <TableCell>{job.cluster}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      {job.status === "running" ? (
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Pause className="h-4 w-4" />
                          <span>Pause Job</span>
                        </DropdownMenuItem>
                      ) : job.status === "queued" ? (
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          <span>Start Job</span>
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        <span>Edit Job</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Job</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

