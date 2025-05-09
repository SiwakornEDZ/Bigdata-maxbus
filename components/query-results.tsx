"use client"

import { useState, useEffect } from "react"
import { Download, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type QueryResult = Record<string, any>
type QueryStats = {
  rowCount: number
  executionTime: number
  columns: string[]
}

export function QueryResults() {
  const [results, setResults] = useState<QueryResult[]>([])
  const [stats, setStats] = useState<QueryStats | null>(null)
  const [activeTab, setActiveTab] = useState("results")

  useEffect(() => {
    // Listen for query results from the VisualQueryBuilder component
    const handleQueryResults = (event: CustomEvent<{ results: QueryResult[]; stats: QueryStats }>) => {
      setResults(event.detail.results)
      setStats(event.detail.stats)
      setActiveTab("results")
    }

    window.addEventListener("queryResults", handleQueryResults as EventListener)

    return () => {
      window.removeEventListener("queryResults", handleQueryResults as EventListener)
    }
  }, [])

  const downloadResults = () => {
    if (results.length === 0) return

    // Convert results to CSV
    const columns = Object.keys(results[0])
    const csvContent = [
      columns.join(","),
      ...results.map((row) =>
        columns
          .map((col) => {
            const value = row[col]
            // Handle values that need quotes (strings with commas, etc.)
            if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      ),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `query-results-${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Query Results</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2" disabled={results.length === 0}>
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={downloadResults}
            disabled={results.length === 0}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="results" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="explain">Explain Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          {results.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No results to display. Execute a query to see results here.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(results[0]).map((column) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.entries(row).map(([column, value], colIndex) => (
                          <TableCell key={`${rowIndex}-${colIndex}`}>
                            {value !== null ? String(value) : <span className="text-muted-foreground">null</span>}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {stats && (
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <div>
                Showing {results.length} of {stats.rowCount} results
              </div>
              <div>Query executed in {stats.executionTime.toFixed(3)} seconds</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-muted p-4 rounded-md">
                <div className="text-sm font-medium">Total Records</div>
                <div className="text-2xl font-bold mt-1">{stats?.rowCount || 0}</div>
              </div>
              <div className="bg-muted p-4 rounded-md">
                <div className="text-sm font-medium">Execution Time</div>
                <div className="text-2xl font-bold mt-1">{stats ? `${stats.executionTime.toFixed(3)}s` : "0s"}</div>
              </div>
              <div className="bg-muted p-4 rounded-md">
                <div className="text-sm font-medium">Columns</div>
                <div className="text-2xl font-bold mt-1">{stats?.columns.length || 0}</div>
              </div>
            </div>

            {stats && (
              <div className="bg-muted p-4 rounded-md">
                <div className="text-sm font-medium mb-2">Column Information</div>
                <div className="space-y-1">
                  {stats.columns.map((column, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className="font-mono">{column}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="explain">
          <div className="bg-muted p-4 rounded-md">
            <div className="text-sm font-medium mb-2">Query Execution Plan</div>
            {stats ? (
              <pre className="overflow-auto whitespace-pre-wrap text-sm">
                {`QUERY PLAN
-------------------------------------------------------------
${stats.executionTime < 0.1 ? "Fast Query Execution" : "Standard Query Execution"}
- Execution Time: ${stats.executionTime.toFixed(3)} seconds
- Rows Returned: ${stats.rowCount}
- Columns: ${stats.columns.join(", ")}
`}
              </pre>
            ) : (
              <div className="text-center p-4 text-muted-foreground">Execute a query to see the execution plan.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

