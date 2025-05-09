"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export function TableRepairTool() {
  const [importJobs, setImportJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [repairing, setRepairing] = useState(false)
  const [repairResult, setRepairResult] = useState(null)

  useEffect(() => {
    fetchImportJobs()
  }, [])

  const fetchImportJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/import-jobs?verify=true")
      if (!response.ok) {
        throw new Error("Failed to fetch import jobs")
      }
      const data = await response.json()
      setImportJobs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const repairTable = async (importId) => {
    try {
      setRepairing(true)
      const response = await fetch("/api/database/repair", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ importId }),
      })

      const result = await response.json()
      setRepairResult(result)

      // Refresh the list after repair
      await fetchImportJobs()
    } catch (err) {
      setError(err.message)
    } finally {
      setRepairing(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>
      case "repair_needed":
        return <Badge className="bg-yellow-500">Repair Needed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getVerificationStatus = (verification) => {
    if (!verification) return null

    if (verification.exists && verification.hasData) {
      return (
        <div className="flex items-center text-green-500">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span>{verification.message}</span>
        </div>
      )
    } else if (verification.exists && !verification.hasData) {
      return (
        <div className="flex items-center text-yellow-500">
          <AlertTriangle className="w-4 h-4 mr-1" />
          <span>{verification.message}</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center text-red-500">
          <XCircle className="w-4 h-4 mr-1" />
          <span>{verification.message}</span>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading import jobs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Table Repair Tool</CardTitle>
        <CardDescription>Verify and repair tables that may be missing or corrupted</CardDescription>
      </CardHeader>
      <CardContent>
        {repairResult && (
          <Alert className={repairResult.tableExists ? "bg-green-50 mb-4" : "bg-yellow-50 mb-4"}>
            <AlertTitle>{repairResult.tableExists ? "Table Exists" : "Repair Initiated"}</AlertTitle>
            <AlertDescription>{repairResult.message}</AlertDescription>
            {!repairResult.tableExists && <div className="mt-2 text-sm">{repairResult.action}</div>}
          </Alert>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Table Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {importJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No import jobs found
                </TableCell>
              </TableRow>
            ) : (
              importJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.name}</TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{job.table_name || "N/A"}</code>
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>{getVerificationStatus(job.table_verification)}</TableCell>
                  <TableCell>
                    {job.table_verification && !job.table_verification.exists && (
                      <Button variant="outline" size="sm" onClick={() => repairTable(job.id)} disabled={repairing}>
                        {repairing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Repairing...
                          </>
                        ) : (
                          "Repair"
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Button onClick={fetchImportJobs} variant="outline" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Refreshing...
            </>
          ) : (
            "Refresh"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

