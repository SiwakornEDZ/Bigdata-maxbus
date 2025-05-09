"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, MoreHorizontal, Search, Plus, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Textarea } from "@/components/ui/textarea"

interface Report {
  id: number
  name: string
  type: string
  description: string
  created_by: string
  file_path: string | null
  size: number | null
  status: string
  scheduled_for: string | null
  created_at: string
  category?: string
}

export function ReportsTable() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [reportType, setReportType] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentReport, setCurrentReport] = useState<Report | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("scheduled")
  const [scheduledFor, setScheduledFor] = useState("")

  useEffect(() => {
    fetchReports()
  }, [reportType])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      const url = reportType === "all" ? "/api/reports" : `/api/reports?type=${reportType}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch reports")
      }

      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddReport = async () => {
    try {
      if (!name || !type) {
        toast({
          title: "Error",
          description: "Name and type are required",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          description,
          created_by: "admin@example.com", // In a real app, this would be the current user
          scheduled_for: scheduledFor || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add report")
      }

      const newReport = await response.json()
      setReports([newReport, ...reports])

      toast({
        title: "Success",
        description: "Report added successfully",
      })

      // Reset form
      setName("")
      setType("")
      setDescription("")
      setScheduledFor("")
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding report:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add report",
        variant: "destructive",
      })
    }
  }

  const handleEditReport = async () => {
    try {
      if (!currentReport) return

      if (!name || !type) {
        toast({
          title: "Error",
          description: "Name and type are required",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/reports/${currentReport.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          description,
          status,
          scheduled_for: scheduledFor || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update report")
      }

      const updatedReport = await response.json()

      setReports(reports.map((report) => (report.id === updatedReport.id ? updatedReport : report)))

      toast({
        title: "Success",
        description: "Report updated successfully",
      })

      // Reset form
      setCurrentReport(null)
      setName("")
      setType("")
      setDescription("")
      setStatus("scheduled")
      setScheduledFor("")
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating report:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update report",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReport = async () => {
    try {
      if (!currentReport) return

      const response = await fetch(`/api/reports/${currentReport.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete report")
      }

      setReports(reports.filter((report) => report.id !== currentReport.id))

      toast({
        title: "Success",
        description: "Report deleted successfully",
      })

      // Reset
      setCurrentReport(null)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting report:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete report",
        variant: "destructive",
      })
    }
  }

  const downloadReport = async (id: number, name: string) => {
    try {
      const response = await fetch(`/api/reports/download/${id}`)

      if (!response.ok) {
        throw new Error("Failed to download report")
      }

      const data = await response.json()

      // In a real application, this would trigger a file download
      // For this example, we'll just show a toast
      toast({
        title: "Success",
        description: `Report "${name}" downloaded successfully`,
      })
    } catch (error) {
      console.error("Error downloading report:", error)
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (report: Report) => {
    setCurrentReport(report)
    setName(report.name)
    setType(report.type)
    setDescription(report.description || "")
    setStatus(report.status)
    setScheduledFor(report.scheduled_for || "")
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (report: Report) => {
    setCurrentReport(report)
    setIsDeleteDialogOpen(true)
  }

  const formatBytes = (bytes: number) => {
    if (!bytes) return "N/A"
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "outline" = "outline"

    switch (status.toLowerCase()) {
      case "completed":
        variant = "default"
        break
      case "processing":
        variant = "secondary"
        break
      case "scheduled":
        variant = "outline"
        break
    }

    return <Badge variant={variant}>{status}</Badge>
  }

  const filteredReports = Array.isArray(reports)
    ? reports.filter((report) => {
        if (!report || typeof report !== "object") return false
        return (
          report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.created_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="inventory">Inventory</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="web">Web</SelectItem>
            <SelectItem value="product">Product</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Report</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Report</DialogTitle>
              <DialogDescription>Create a new report.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Monthly Sales Report"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive analysis of monthly sales performance"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scheduled_for">Schedule For (optional)</Label>
                <Input
                  id="scheduled_for"
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReport}>Add Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        {filteredReports.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-center text-muted-foreground">No reports found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.type}</Badge>
                  </TableCell>
                  <TableCell>{report.created_by}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>{formatBytes(report.size || 0)}</TableCell>
                  <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
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
                          onClick={() => downloadReport(report.id, report.name)}
                          disabled={report.status !== "completed"}
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2" onClick={() => openEditDialog(report)}>
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive"
                          onClick={() => openDeleteDialog(report)}
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
            <DialogTitle>Edit Report</DialogTitle>
            <DialogDescription>Update the report details.</DialogDescription>
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
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-scheduled-for">Schedule For (optional)</Label>
              <Input
                id="edit-scheduled-for"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditReport}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReport}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

