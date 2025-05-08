"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SqlResultsProps {
  results: any[]
}

export function SqlResults({ results }: SqlResultsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Reset to first page when results change
  useEffect(() => {
    setCurrentPage(1)
    setSortColumn(null)
    setSortDirection("asc")
  }, [results])

  // ฟังก์ชันสำหรับค้นหา
  const filteredResults = Array.isArray(results)
    ? results.filter((row) => {
        if (!row || typeof row !== "object") return false
        return Object.values(row).some((value) => {
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      })
    : []

  // ฟังก์ชันสำหรับเรียงลำดับ
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (!sortColumn) return 0

    // ตรวจสอบว่า a และ b เป็น object หรือไม่
    if (!a || typeof a !== "object" || !b || typeof b !== "object") return 0

    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    // จัดการกับค่า null
    if (aValue === null && bValue === null) return 0
    if (aValue === null) return sortDirection === "asc" ? -1 : 1
    if (bValue === null) return sortDirection === "asc" ? 1 : -1

    // เรียงลำดับตามประเภทข้อมูล
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    // แปลงเป็น string สำหรับการเปรียบเทียบ
    const aString = String(aValue).toLowerCase()
    const bString = String(bValue).toLowerCase()

    return sortDirection === "asc" ? aString.localeCompare(bString) : bString.localeCompare(aString)
  })

  // ฟังก์ชันสำหรับจัดการการเรียงลำดับ
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // ฟังก์ชันสำหรับแบ่งหน้า
  const totalPages = Math.ceil(sortedResults.length / rowsPerPage)
  const paginatedResults = sortedResults.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // ฟังก์ชันสำหรับแสดงค่าในเซลล์
  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>
    }

    if (typeof value === "object") {
      try {
        return <span className="font-mono text-xs">{JSON.stringify(value)}</span>
      } catch (e) {
        return <span className="font-mono text-xs">[Object]</span>
      }
    }

    if (typeof value === "boolean") {
      return value ? "true" : "false"
    }

    return String(value)
  }

  if (!results || !Array.isArray(results) || results.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-center text-muted-foreground">No results found</p>
      </div>
    )
  }

  const columns = results && results.length > 0 && typeof results[0] === "object" ? Object.keys(results[0]) : []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search results..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="pl-8"
          />
        </div>
        <Select
          value={rowsPerPage.toString()}
          onValueChange={(value) => {
            setRowsPerPage(Number.parseInt(value))
            setCurrentPage(1) // Reset to first page when changing rows per page
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rows per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 rows per page</SelectItem>
            <SelectItem value="25">25 rows per page</SelectItem>
            <SelectItem value="50">50 rows per page</SelectItem>
            <SelectItem value="100">100 rows per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column}>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-0 font-medium hover:bg-transparent"
                      onClick={() => handleSort(column)}
                    >
                      {column}
                      {sortColumn === column ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResults.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column}`}>{renderCellValue(row[column])}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {paginatedResults.length} of {filteredResults.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
