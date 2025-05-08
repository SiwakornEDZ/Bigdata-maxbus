"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Edit, Trash2 } from "lucide-react"

export default function DataSourcesTable() {
  const [dataSources, setDataSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDataSources() {
      try {
        const response = await fetch("/api/data-sources")
        if (!response.ok) throw new Error("Failed to fetch data sources")
        const data = await response.json()
        setDataSources(data)
      } catch (err) {
        console.error("Error fetching data sources:", err)
        setError("Failed to load data sources. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDataSources()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this data source?")) return

    try {
      // ปรับปรุง URL ให้ตรงกับโครงสร้างใหม่
      const response = await fetch(`/api/data-sources/by-id/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete data source")

      setDataSources(dataSources.filter((source) => source.id !== id))
    } catch (err) {
      console.error("Error deleting data source:", err)
      alert("Failed to delete data source. Please try again.")
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-red-500">
            <AlertCircle className="w-3 h-3 mr-1" /> Error
          </Badge>
        )
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>
    }
  }

  if (loading) return <div className="flex justify-center p-4">Loading data sources...</div>
  if (error) return <div className="text-red-500 p-4">{error}</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Sources</CardTitle>
      </CardHeader>
      <CardContent>
        {dataSources.length === 0 ? (
          <div className="text-center p-4">No data sources found. Add your first data source to get started.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataSources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell>{source.type}</TableCell>
                  <TableCell>{getStatusBadge(source.status)}</TableCell>
                  <TableCell>{new Date(source.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleDelete(source.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
