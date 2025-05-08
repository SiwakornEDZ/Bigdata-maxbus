"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, BarChart3, Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
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
import { Loader2 } from "lucide-react"

type KafkaTopic = {
  name: string
  partitions: number
  replicationFactor: number
  messagesPerSec: number
  retentionHours: number
  sizeGB: number
  status: string
}

export function KafkaTopicsTable() {
  const [topics, setTopics] = useState<KafkaTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortColumn, setSortColumn] = useState("messagesPerSec")
  const [sortDirection, setSortDirection] = useState("desc")
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [newTopic, setNewTopic] = useState({
    name: "",
    partitions: 3,
    replicationFactor: 3,
    retentionHours: 72,
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/kafka/topics")

      if (!response.ok) {
        throw new Error("Failed to fetch Kafka topics")
      }

      const data = await response.json()
      if (data.success) {
        setTopics(data.topics)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to fetch Kafka topics",
        })
      }
    } catch (error) {
      console.error("Error fetching Kafka topics:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching Kafka topics",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleCreateTopic = async () => {
    try {
      setIsCreating(true)

      const response = await fetch("/api/kafka/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTopic),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `Topic ${newTopic.name} created successfully`,
        })
        setTopics([...topics, data.topic])
        setIsDialogOpen(false)
        setNewTopic({
          name: "",
          partitions: 3,
          replicationFactor: 3,
          retentionHours: 72,
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Failed to create topic",
        })
      }
    } catch (error) {
      console.error("Error creating Kafka topic:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while creating the topic",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const filteredTopics = Array.isArray(topics)
    ? topics.filter((topic) => {
        if (!topic || typeof topic !== "object") return false
        return (
          topic.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.partitions?.toString().includes(searchTerm.toLowerCase()) ||
          topic.replicationFactor?.toString().includes(searchTerm.toLowerCase()) ||
          topic.status?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    : []

  const sortedData = [...filteredTopics].sort((a, b) => {
    const aValue = a[sortColumn as keyof KafkaTopic]
    const bValue = b[sortColumn as keyof KafkaTopic]

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Topic</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Kafka Topic</DialogTitle>
              <DialogDescription>Enter the details for the new Kafka topic</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="topic-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="topic-name"
                  value={newTopic.name}
                  onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="partitions" className="text-right">
                  Partitions
                </Label>
                <Input
                  id="partitions"
                  type="number"
                  value={newTopic.partitions}
                  onChange={(e) => setNewTopic({ ...newTopic, partitions: Number.parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="replication-factor" className="text-right">
                  Replication Factor
                </Label>
                <Input
                  id="replication-factor"
                  type="number"
                  value={newTopic.replicationFactor}
                  onChange={(e) => setNewTopic({ ...newTopic, replicationFactor: Number.parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="retention-hours" className="text-right">
                  Retention (hours)
                </Label>
                <Input
                  id="retention-hours"
                  type="number"
                  value={newTopic.retentionHours}
                  onChange={(e) => setNewTopic({ ...newTopic, retentionHours: Number.parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTopic} disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Topic
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 p-0 font-medium"
                  >
                    Topic Name
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
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("partitions")}
                    className="flex items-center gap-1 p-0 font-medium"
                  >
                    Partitions
                    {sortColumn === "partitions" ? (
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
                <TableHead>Replication</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("messagesPerSec")}
                    className="flex items-center gap-1 p-0 font-medium"
                  >
                    Messages/sec
                    {sortColumn === "messagesPerSec" ? (
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
                <TableHead>Retention</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("sizeGB")}
                    className="flex items-center gap-1 p-0 font-medium"
                  >
                    Size
                    {sortColumn === "sizeGB" ? (
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
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((topic) => (
                <TableRow key={topic.name}>
                  <TableCell className="font-medium">{topic.name}</TableCell>
                  <TableCell>{topic.partitions}</TableCell>
                  <TableCell>{topic.replicationFactor}x</TableCell>
                  <TableCell>{topic.messagesPerSec.toLocaleString()}</TableCell>
                  <TableCell>{topic.retentionHours} hours</TableCell>
                  <TableCell>{topic.sizeGB} GB</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      <span>{topic.status}</span>
                    </div>
                  </TableCell>
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
                          <span>View Metrics</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          <span>Edit Config</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Topic</span>
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
