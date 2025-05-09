"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle,
  Clock,
  Download,
  MoreHorizontal,
  RefreshCw,
  XCircle,
  Loader2,
  Database,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

type ImportJob = {
  id: number
  name: string
  source_name?: string
  source_type: string
  destination: string
  status: string
  records_count: number | null
  created_at: string
  completed_at?: string
  source_id?: string
  file_name?: string
  file_size?: number
  file_type?: string
  error_message?: string
  created_by?: string
  table_name?: string
}

export function ImportHistory() {
  const router = useRouter()
  const [importJobs, setImportJobs] = useState<ImportJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortColumn, setSortColumn] = useState("created_at")
  const [sortDirection, setSortDirection] = useState("desc")
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchImportJobs = useCallback(
    async (showToast = false) => {
      try {
        if (showToast) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }

        const response = await fetch("/api/import-jobs", {
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch import jobs")
        }

        const data = await response.json()
        setImportJobs(data)
        setError(null)

        if (showToast) {
          toast({
            title: "Refreshed",
            description: "Import job list has been refreshed",
          })
        }
      } catch (err: any) {
        console.error("Error fetching import jobs:", err)
        setError(err.message || "Failed to load import history. Please try again.")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    fetchImportJobs()

    // Poll for updates every 5 seconds
    const intervalId = setInterval(() => fetchImportJobs(), 5000)

    return () => clearInterval(intervalId)
  }, [fetchImportJobs])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const filteredJobs = Array.isArray(importJobs)
    ? importJobs.filter((job) => {
        if (!job || typeof job !== "object") return false
        return (
          job.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.source_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.created_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.table_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    : []

  const sortedData = [...filteredJobs].sort((a, b) => {
    const aValue = a[sortColumn as keyof ImportJob]
    const bValue = b[sortColumn as keyof ImportJob]

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "N/A"
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const handleReimport = async (jobId: number) => {
    try {
      const originalJob = importJobs.find((job) => job.id === jobId)
      if (!originalJob) return

      toast({
        title: "Reimporting",
        description: "Starting reimport process...",
      })

      const response = await fetch("/api/import-jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${originalJob.name} (Reimport)`,
          sourceType: originalJob.source_type,
          sourceId: originalJob.source_id,
          destination: originalJob.destination,
          fileName: originalJob.file_name,
          fileSize: originalJob.file_size,
          fileType: originalJob.file_type,
          tableName: `${originalJob.table_name || `imported_data_${originalJob.id}`}_reimport`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to reimport job")
      }

      toast({
        title: "Success",
        description: "Job reimported successfully",
      })

      // Refresh the jobs list
      fetchImportJobs()
    } catch (error: any) {
      console.error("Error reimporting job:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reimport job",
      })
    }
  }

  const viewInSqlEditor = (job: ImportJob) => {
    const tableName = job.table_name || `imported_data_${job.id}`
    const query = `SELECT * FROM ${tableName} LIMIT 100;`

    // Store the query in localStorage for the SQL Editor to use
    localStorage.setItem("lastImportQuery", query)

    // Navigate to SQL Editor
    router.push("/sql-editor?import=true")
  }

  const viewInQueryBuilder = (job: ImportJob) => {
    const tableName = job.table_name || `imported_data_${job.id}`

    // Store the table name in localStorage for the Query Builder to use
    localStorage.setItem("lastImportTable", tableName)

    // Navigate to Query Builder
    router.push("/query-builder?import=true")
  }

  if (isLoading && importJobs.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Loading import history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={() => fetchImportJobs()} variant="outline" className="mt-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search imports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" size="icon" onClick={() => fetchImportJobs(true)} disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {importJobs.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground mb-2">No import jobs found.</p>
          <p className="text-sm text-muted-foreground">
            Start by importing data from the File Upload or Data Source tabs.
          </p>
        </div>
      ) : (
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
                    ID
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
                <TableHead>Source</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-1 p-0 font-medium"
                  >
                    Status
                    {sortColumn === "status" ? (
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
                <TableHead className="text-right">Records</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("created_at")}
                    className="flex items-center gap-1 p-0 font-medium"
                  >
                    Date
                    {sortColumn === "created_at" ? (
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
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.source_name || item.source_type}</TableCell>
                  <TableCell className="font-mono text-xs">{item.table_name || `imported_data_${item.id}`}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="capitalize">{item.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.records_count ? item.records_count.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell>{formatTimestamp(item.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => viewInSqlEditor(item)}
                          disabled={item.status !== "completed"}
                        >
                          <Database className="h-4 w-4" />
                          <span>View in SQL Editor</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => viewInQueryBuilder(item)}
                          disabled={item.status !== "completed"}
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View in Query Builder</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleReimport(item.id)}>
                          <RefreshCw className="h-4 w-4" />
                          <span>Reimport</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

