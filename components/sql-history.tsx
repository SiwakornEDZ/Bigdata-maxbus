"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Play, Trash2, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

interface SqlHistoryItem {
  id: number
  sql: string
  timestamp: string
  rowCount: number
}

interface SqlHistoryProps {
  onSelectQuery: (query: string) => void
}

export function SqlHistory({ onSelectQuery }: SqlHistoryProps) {
  const [history, setHistory] = useState<SqlHistoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  // โหลดประวัติจาก localStorage
  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedHistory = localStorage.getItem("sqlHistory")
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory))
        }
      } catch (err) {
        console.error("Error parsing SQL history:", err)
        // ถ้าเกิด error ให้ล้าง localStorage และตั้งค่าเป็น array ว่าง
        localStorage.removeItem("sqlHistory")
        setHistory([])
      }
    }

    // โหลดประวัติเมื่อคอมโพเนนต์ถูกโหลด
    loadHistory()

    // ตั้งค่า event listener เพื่อตรวจจับการเปลี่ยนแปลงใน localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sqlHistory") {
        loadHistory()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // ฟังก์ชันสำหรับลบรายการประวัติ
  const deleteHistoryItem = (id: number) => {
    const updatedHistory = history.filter((item) => item.id !== id)
    setHistory(updatedHistory)
    localStorage.setItem("sqlHistory", JSON.stringify(updatedHistory))

    toast({
      title: "History item deleted",
      description: "The query has been removed from your history",
    })
  }

  // ฟังก์ชันสำหรับลบประวัติทั้งหมด
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("sqlHistory")

    toast({
      title: "History cleared",
      description: "All queries have been removed from your history",
    })
  }

  // ฟังก์ชันสำหรับฟอร์แมตเวลา
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // กรองประวัติตามคำค้นหา
  const filteredHistory = Array.isArray(history)
    ? history.filter((item) => {
        if (!item || typeof item !== "object") return false
        return (
          item.sql?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          new Date(item.timestamp).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    : []

  if (history.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-center text-muted-foreground">No query history found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Query History</h3>
        <Button variant="outline" size="sm" onClick={clearHistory}>
          Clear History
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search in history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-center text-muted-foreground">No queries match your search</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimestamp(item.timestamp)}</span>
                    <span className="text-xs">({item.rowCount} rows)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectQuery(item.sql)}
                      className="flex items-center gap-1"
                    >
                      <Play className="h-3 w-3" />
                      <span>Use</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteHistoryItem(item.id)}
                      className="flex items-center gap-1 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
                <pre className="mt-2 max-h-24 overflow-auto rounded-md bg-muted p-2 text-xs">{item.sql}</pre>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
