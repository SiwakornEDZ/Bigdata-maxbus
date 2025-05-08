"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Trash2, FolderOpen, Clock, Edit } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface SavedQuery {
  id: number
  name: string
  description?: string
  queryText: string
  category: string
  createdAt: string
  updatedAt: string
  executionCount: number
  lastExecutedAt?: string
}

interface SqlSavedQueriesProps {
  onSelectQuery: (query: string) => void
}

export function SqlSavedQueries({ onSelectQuery }: SqlSavedQueriesProps) {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentQuery, setCurrentQuery] = useState<SavedQuery | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editCategory, setEditCategory] = useState("general")
  const [categories, setCategories] = useState<string[]>([])
  const [isUpdatingStats, setIsUpdatingStats] = useState(false)
  const [queryToUse, setQueryToUse] = useState<SavedQuery | null>(null)
  const onSelectQueryRef = useRef(onSelectQuery)

  useEffect(() => {
    onSelectQueryRef.current = onSelectQuery
  }, [onSelectQuery])

  // โหลดคิวรี่ที่บันทึกไว้จาก API
  const fetchSavedQueries = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/saved-queries${categoryFilter !== "all" ? `?category=${categoryFilter}` : ""}`)

      if (!response.ok) {
        throw new Error("Failed to fetch saved queries")
      }

      const data = await response.json()
      setSavedQueries(Array.isArray(data) ? data : [])

      // รวบรวมหมวดหมู่ที่มีอยู่
      if (Array.isArray(data) && data.length > 0) {
        const uniqueCategories = Array.from(new Set(data.map((query: SavedQuery) => query.category)))
        setCategories(uniqueCategories)
      }
    } catch (err) {
      console.error("Error fetching saved queries:", err)
      toast({
        title: "Error",
        description: "Failed to load saved queries",
        variant: "destructive",
      })
      setSavedQueries([])
    } finally {
      setIsLoading(false)
    }
  }, [categoryFilter])

  useEffect(() => {
    fetchSavedQueries()
  }, [fetchSavedQueries])

  // ฟังก์ชันสำหรับลบคิวรี่ที่บันทึกไว้
  const deleteQuery = async (id: number) => {
    try {
      const response = await fetch(`/api/saved-queries/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete query")
      }

      setSavedQueries(savedQueries.filter((query) => query.id !== id))

      toast({
        title: "Query deleted",
        description: "The query has been deleted successfully",
      })
    } catch (err) {
      console.error("Error deleting query:", err)
      toast({
        title: "Error",
        description: "Failed to delete query",
        variant: "destructive",
      })
    }
  }

  // ฟังก์ชันสำหรับเปิดไดอะล็อกแก้ไข
  const openEditDialog = (query: SavedQuery) => {
    setCurrentQuery(query)
    setEditName(query.name)
    setEditDescription(query.description || "")
    setEditCategory(query.category)
    setEditDialogOpen(true)
  }

  // ฟังก์ชันสำหรับบันทึกการแก้ไข
  const saveEdit = async () => {
    if (!currentQuery) return

    try {
      const response = await fetch(`/api/saved-queries/${currentQuery.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          queryText: currentQuery.queryText,
          category: editCategory,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update query")
      }

      const updatedQuery = await response.json()

      // อัปเดตรายการคิวรี่
      setSavedQueries(savedQueries.map((query) => (query.id === currentQuery.id ? updatedQuery : query)))

      toast({
        title: "Query updated",
        description: "The query has been updated successfully",
      })

      setEditDialogOpen(false)
    } catch (err) {
      console.error("Error updating query:", err)
      toast({
        title: "Error",
        description: "Failed to update query",
        variant: "destructive",
      })
    }
  }

  // ฟังก์ชันสำหรับใช้คิวรี่และอัปเดตสถิติ
  const useQuery = (query: SavedQuery) => {
    setQueryToUse(query)
  }

  useEffect(() => {
    const updateQueryStats = async () => {
      if (!queryToUse) return

      onSelectQueryRef.current(queryToUse.queryText)

      if (isUpdatingStats) return

      try {
        setIsUpdatingStats(true)
        await fetch(`/api/saved-queries/${queryToUse.id}/execute`, {
          method: "POST",
        })

        setSavedQueries(
          savedQueries.map((q) =>
            q.id === queryToUse.id
              ? { ...q, executionCount: q.executionCount + 1, lastExecutedAt: new Date().toISOString() }
              : q,
          ),
        )
      } catch (err) {
        console.error("Error updating execution stats:", err)
      } finally {
        setIsUpdatingStats(false)
        setQueryToUse(null)
      }
    }

    updateQueryStats()
  }, [queryToUse, savedQueries, isUpdatingStats])

  // ฟังก์ชันสำหรับฟอร์แมตเวลา
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // กรองคิวรี่ตามการค้นหา
  const filteredQueries = Array.isArray(savedQueries)
    ? savedQueries.filter((query) => {
        if (!query || typeof query !== "object") return false
        return (
          query.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.category?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    : []

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading saved queries...</p>
        </div>
      </div>
    )
  }

  if (savedQueries.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <FolderOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-center text-muted-foreground">No saved queries found</p>
          <p className="text-center text-sm text-muted-foreground">
            Save your frequently used queries for quick access
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search saved queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredQueries.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-center text-muted-foreground">No queries match your search</p>
          </div>
        ) : (
          filteredQueries.map((query) => (
            <Card key={query.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{query.name}</h4>
                    {query.description && <p className="text-sm text-muted-foreground">{query.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => useQuery(query)}
                      className="flex items-center gap-1"
                      disabled={isUpdatingStats}
                    >
                      <Play className="h-3 w-3" />
                      <span>Use</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(query)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuery(query.id)}
                      className="flex items-center gap-1 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">{query.category}</Badge>
                  <span className="text-xs text-muted-foreground">Saved on {formatTimestamp(query.createdAt)}</span>
                  {query.executionCount > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Used {query.executionCount} times
                    </span>
                  )}
                </div>
                <pre className="mt-2 max-h-24 overflow-auto rounded-md bg-muted p-2 text-xs">{query.queryText}</pre>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit SQL Query</DialogTitle>
            <DialogDescription>Update the details of your saved SQL query.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Query Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="reporting">Reporting</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                  <SelectItem value="data-import">Data Import</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
