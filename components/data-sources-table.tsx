"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Search, Trash2, Edit, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"

interface DataSource {
  id: number
  name: string
  type: string
  connection_details: any
  status: string
  last_sync: string
  created_at: string
}

export function DataSourcesTable() {
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentDataSource, setCurrentDataSource] = useState<DataSource | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [connectionDetails, setConnectionDetails] = useState("")
  const [status, setStatus] = useState("active")

  useEffect(() => {
    fetchDataSources()
  }, [])

  const fetchDataSources = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/data-sources")

      if (!response.ok) {
        throw new Error("Failed to fetch data sources")
      }

      const data = await response.json()
      setDataSources(data)
    } catch (error) {
      console.error("Error fetching data sources:", error)
      toast({
        title: "Error",
        description: "Failed to load data sources",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDataSource = async () => {
    try {
      if (!name || !type) {
        toast({
          title: "Error",
          description: "Name and type are required",
          variant: "destructive",
        })
        return
      }

      let parsedConnectionDetails = {}
      try {
        parsedConnectionDetails = connectionDetails ? JSON.parse(connectionDetails) : {}
      } catch (e) {
        toast({
          title: "Error",
          description: "Invalid JSON in connection details",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/data-sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          connection_details: parsedConnectionDetails,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add data source")
      }

      const newDataSource = await response.json()
      setDataSources([newDataSource, ...dataSources])

      toast({
        title: "Success",
        description: "Data source added successfully",
      })

      // Reset form
      setName("")
      setType("")
      setConnectionDetails("")
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding data source:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add data source",
        variant: "destructive",
      })
    }
  }

  const handleEditDataSource = async () => {
    try {
      if (!currentDataSource) return

      if (!name || !type) {
        toast({
          title: "Error",
          description: "Name and type are required",
          variant: "destructive",
        })
        return
      }

      let parsedConnectionDetails = {}
      try {
        parsedConnectionDetails = connectionDetails ? JSON.parse(connectionDetails) : {}
      } catch (e) {
        toast({
          title: "Error",
          description: "Invalid JSON in connection details",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/data-sources/${currentDataSource.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          connection_details: parsedConnectionDetails,
          status,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update data source")
      }

      const updatedDataSource = await response.json()

      setDataSources(dataSources.map((ds) => (ds.id === updatedDataSource.id ? updatedDataSource : ds)))

      toast({
        title: "Success",
        description: "Data source updated successfully",
      })

      // Reset form
      setCurrentDataSource(null)
      setName("")
      setType("")
      setConnectionDetails("")
      setStatus("active")
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating data source:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update data source",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDataSource = async () => {
    try {
      if (!currentDataSource) return

      const response = await fetch(`/api/data-sources/${currentDataSource.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete data source")
      }

      setDataSources(dataSources.filter((ds) => ds.id !== currentDataSource.id))

      toast({
        title: "Success",
        description: "Data source deleted successfully",
      })

      // Reset
      setCurrentDataSource(null)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting data source:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete data source",
        variant: "destructive",
      })
    }
  }

  const handleSyncDataSource = async (id: number) => {
    try {
      // In a real application, this would trigger a sync process
      // For this example, we'll just update the last_sync timestamp
      const response = await fetch(`/api/data-sources/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: dataSources.find((ds) => ds.id === id)?.name,
          type: dataSources.find((ds) => ds.id === id)?.type,
          connection_details: dataSources.find((ds) => ds.id === id)?.connection_details,
          status: dataSources.find((ds) => ds.id === id)?.status,
          last_sync: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to sync data source")
      }

      const updatedDataSource = await response.json()

      setDataSources(dataSources.map((ds) => (ds.id === updatedDataSource.id ? updatedDataSource : ds)))

      toast({
        title: "Success",
        description: "Data source synced successfully",
      })
    } catch (error) {
      console.error("Error syncing data source:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to sync data source",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (dataSource: DataSource) => {
    setCurrentDataSource(dataSource)
    setName(dataSource.name)
    setType(dataSource.type)
    setConnectionDetails(JSON.stringify(dataSource.connection_details, null, 2))
    setStatus(dataSource.status)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (dataSource: DataSource) => {
    setCurrentDataSource(dataSource)
    setIsDeleteDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline"

    switch (status.toLowerCase()) {
      case "active":
        variant = "default"
        break
      case "inactive":
        variant = "destructive"
        break
    }

    return <Badge variant={variant}>{status}</Badge>
  }

  const filteredDataSources = Array.isArray(dataSources)
    ? dataSources.filter((source) => {
        if (!source || typeof source !== "object") return false
        return (
          source.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          source.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          source.connection_string?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          source.created_by?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    : []

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search data sources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Data Source</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Data Source</DialogTitle>
              <DialogDescription>Add a new data source to connect to your data.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="MySQL Production DB"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MySQL">MySQL</SelectItem>
                    <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                    <SelectItem value="Kafka">Kafka</SelectItem>
                    <SelectItem value="REST API">REST API</SelectItem>
                    <SelectItem value="SQL Server">SQL Server</SelectItem>
                    <SelectItem value="S3">S3</SelectItem>
                    <SelectItem value="Streaming">Streaming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="connection_details">Connection Details (JSON)</Label>
                <Textarea
                  id="connection_details"
                  value={connectionDetails}
                  onChange={(e) => setConnectionDetails(e.target.value)}
                  placeholder={"{'host': 'example.com', 'port': 3306, 'database': 'mydb'}"}
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDataSource}>Add Data Source</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        {filteredDataSources.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-center text-muted-foreground">No data sources found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDataSources.map((dataSource) => (
                <TableRow key={dataSource.id}>
                  <TableCell className="font-medium">{dataSource.name}</TableCell>
                  <TableCell>{dataSource.type}</TableCell>
                  <TableCell>{getStatusBadge(dataSource.status)}</TableCell>
                  <TableCell>{new Date(dataSource.last_sync).toLocaleString()}</TableCell>
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
                          onClick={() => openEditDialog(dataSource)}
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => handleSyncDataSource(dataSource.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>Sync Now</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive"
                          onClick={() => openDeleteDialog(dataSource)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Source</DialogTitle>
            <DialogDescription>Update the data source details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MySQL">MySQL</SelectItem>
                  <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                  <SelectItem value="Kafka">Kafka</SelectItem>
                  <SelectItem value="REST API">REST API</SelectItem>
                  <SelectItem value="SQL Server">SQL Server</SelectItem>
                  <SelectItem value="S3">S3</SelectItem>
                  <SelectItem value="Streaming">Streaming</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-connection-details">Connection Details (JSON)</Label>
              <Textarea
                id="edit-connection-details"
                value={connectionDetails}
                onChange={(e) => setConnectionDetails(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDataSource}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Data Source</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this data source? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDataSource}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

