"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { SqlResults } from "@/components/sql-results"
import { SqlHistory } from "@/components/sql-history"
import { SqlSavedQueries } from "@/components/sql-saved-queries"
import { SqlExamples } from "@/components/sql-examples"
import { Loader2, Save, Play, Database, RefreshCw, Trash2, Eye, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SqlEditor() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[] | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [queryName, setQueryName] = useState("")
  const [queryDescription, setQueryDescription] = useState("")
  const [activeTab, setActiveTab] = useState("editor")
  const [tables, setTables] = useState<any[]>([])
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableDetails, setTableDetails] = useState<any | null>(null)
  const [isLoadingTableDetails, setIsLoadingTableDetails] = useState(false)
  const [isRefreshingTables, setIsRefreshingTables] = useState(false)
  const [isDeletingTable, setIsDeletingTable] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [importedTables, setImportedTables] = useState<any[]>([])
  const [isLoadingImportedTables, setIsLoadingImportedTables] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Check for imported query from Visual Query Builder
  useEffect(() => {
    const importedQuery = localStorage.getItem("lastImportQuery")
    if (importedQuery) {
      setQuery(importedQuery)
      localStorage.removeItem("lastImportQuery")
    }
  }, [])

  // Load tables for Database tab
  useEffect(() => {
    if (activeTab === "database") {
      fetchTables()
      fetchImportedTables()
    }
  }, [activeTab])

  const fetchImportedTables = async () => {
    try {
      setIsLoadingImportedTables(true)
      const response = await fetch("/api/import-jobs?status=completed")

      if (!response.ok) {
        throw new Error("Failed to fetch imported tables")
      }

      const data = await response.json()
      setImportedTables(data)
    } catch (error) {
      console.error("Error fetching imported tables:", error)
      toast({
        title: "Error",
        description: "Failed to load imported tables",
        variant: "destructive",
      })
    } finally {
      setIsLoadingImportedTables(false)
    }
  }

  const fetchTables = async () => {
    try {
      setIsLoadingTables(true)
      const response = await fetch("/api/database/tables")

      if (!response.ok) {
        throw new Error("Failed to fetch tables")
      }

      const data = await response.json()
      setTables(data)
    } catch (error) {
      console.error("Error fetching tables:", error)
      toast({
        title: "Error",
        description: "Failed to load database tables",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTables(false)
    }
  }

  const refreshTables = async () => {
    setIsRefreshingTables(true)
    await fetchTables()
    await fetchImportedTables()
    setIsRefreshingTables(false)
    toast({
      title: "Tables refreshed",
      description: "The table list has been updated",
    })
  }

  const fetchTableDetails = async (tableName: string) => {
    try {
      setIsLoadingTableDetails(true)
      setSelectedTable(tableName)

      const response = await fetch(`/api/database/tables/${tableName}`)

      if (!response.ok) {
        throw new Error("Failed to fetch table details")
      }

      const data = await response.json()
      setTableDetails(data)
    } catch (error) {
      console.error(`Error fetching details for table ${tableName}:`, error)
      toast({
        title: "Error",
        description: `Failed to load details for table ${tableName}`,
        variant: "destructive",
      })
      setTableDetails(null)
    } finally {
      setIsLoadingTableDetails(false)
    }
  }

  const deleteTable = async (tableName: string) => {
    try {
      setIsDeletingTable(true)

      const response = await fetch(`/api/database/tables/${tableName}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete table")
      }

      toast({
        title: "Table deleted",
        description: `Table ${tableName} has been deleted successfully`,
      })

      // Refresh tables list and clear selected table
      fetchTables()
      fetchImportedTables()
      setSelectedTable(null)
      setTableDetails(null)
    } catch (error) {
      console.error(`Error deleting table ${tableName}:`, error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to delete table ${tableName}`,
        variant: "destructive",
      })
    } finally {
      setIsDeletingTable(false)
    }
  }

  const executeQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a SQL query",
        variant: "destructive",
      })
      return
    }

    setIsExecuting(true)
    setResults(null)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/execute-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: query }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to execute query")
      }

      if (data.success) {
        setResults(data.results || [])
        toast({
          title: "Query executed",
          description: `Retrieved ${data.results?.length || 0} results`,
        })
      } else {
        throw new Error(data.error || "Failed to execute query")
      }
    } catch (error) {
      console.error("Error executing query:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to execute query")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to execute query",
        variant: "destructive",
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const saveQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Error",
        description: "Please enter a SQL query",
        variant: "destructive",
      })
      return
    }

    if (!queryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your query",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/saved-queries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: queryName,
          description: queryDescription,
          query: query,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save query")
      }

      toast({
        title: "Query saved",
        description: "Your query has been saved successfully",
      })

      // Reset form
      setQueryName("")
      setQueryDescription("")
    } catch (error) {
      console.error("Error saving query:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save query",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const viewTableData = (tableName: string) => {
    const viewQuery = `SELECT * FROM "${tableName}" LIMIT 100;`
    setQuery(viewQuery)
    setActiveTab("editor")

    // Execute the query automatically
    setTimeout(() => {
      executeQuery()
    }, 100)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>SQL Editor</CardTitle>
        <CardDescription>Write and execute SQL queries against your database</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="saved">Saved Queries</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <div className="relative">
              <textarea
                ref={textareaRef}
                className="min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                placeholder="SELECT * FROM users;"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button onClick={executeQuery} disabled={isExecuting}>
                  {isExecuting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute
                    </>
                  )}
                </Button>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save Query
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Query</DialogTitle>
                    <DialogDescription>Save this query for future use</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Query Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter a name for your query"
                        value={queryName}
                        onChange={(e) => setQueryName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Input
                        id="description"
                        placeholder="Enter a description"
                        value={queryDescription}
                        onChange={(e) => setQueryDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={saveQuery} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Query"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {errorMessage && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {results !== null && (
              <div className="mt-4">
                <h3 className="mb-2 text-lg font-medium">Results</h3>
                <SqlResults results={results} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <SqlHistory
              onSelect={(query) => {
                setQuery(query)
                setActiveTab("editor")
              }}
            />
          </TabsContent>

          <TabsContent value="saved">
            <SqlSavedQueries
              onSelect={(query) => {
                setQuery(query)
                setActiveTab("editor")
              }}
              onExecute={(query) => {
                setQuery(query)
                setActiveTab("editor")
                setTimeout(() => {
                  executeQuery()
                }, 100)
              }}
            />
          </TabsContent>

          <TabsContent value="examples">
            <SqlExamples
              onSelect={(query) => {
                setQuery(query)
                setActiveTab("editor")
              }}
            />
          </TabsContent>

          <TabsContent value="database">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Database Tables</h3>
              <Button variant="outline" size="sm" onClick={refreshTables} disabled={isRefreshingTables}>
                {isRefreshingTables ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2">Refresh</span>
              </Button>
            </div>

            {/* Imported Tables Section */}
            <div className="mb-8">
              <h4 className="text-md font-medium mb-3">Imported Tables</h4>
              {isLoadingImportedTables ? (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : importedTables.length === 0 ? (
                <div className="text-center py-4 border rounded-md">
                  <Database className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No imported tables found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {importedTables.map((importJob) => (
                    <Card key={importJob.id} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-base">{importJob.name}</CardTitle>
                            <CardDescription>
                              {importJob.records_count} records • {formatBytes(Number.parseInt(importJob.file_size))}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => viewTableData(importJob.table_name)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the imported table{" "}
                                    <span className="font-bold">{importJob.table_name}</span> and all its data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteTable(importJob.table_name)}
                                    disabled={isDeletingTable}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {isDeletingTable ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      "Delete Table"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-xs text-muted-foreground">
                          <div>
                            Table name: <span className="font-mono">{importJob.table_name}</span>
                          </div>
                          <div>Imported from: {importJob.file_name}</div>
                          <div>Imported on: {new Date(importJob.created_at).toLocaleString()}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => viewTableData(importJob.table_name)}
                        >
                          View Data
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* System Tables Section */}
            <div>
              <h4 className="text-md font-medium mb-3">System Tables</h4>
              {isLoadingTables ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : tables.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No tables found in the database</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tables.map((table) => (
                    <Card key={table.table_name} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-base">{table.table_name}</CardTitle>
                            <CardDescription>
                              {table.column_count} columns • {formatBytes(table.table_size)}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => viewTableData(table.table_name)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the table{" "}
                                    <span className="font-bold">{table.table_name}</span> and all its data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteTable(table.table_name)}
                                    disabled={isDeletingTable}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {isDeletingTable ? (
                                      <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      "Delete Table"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Button
                          variant="ghost"
                          className="w-full rounded-none py-2 justify-start"
                          onClick={() => fetchTableDetails(table.table_name)}
                        >
                          {selectedTable === table.table_name ? "Hide Details" : "View Structure"}
                        </Button>

                        {selectedTable === table.table_name && (
                          <div className="p-4 border-t">
                            {isLoadingTableDetails ? (
                              <div className="flex justify-center items-center h-20">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              </div>
                            ) : tableDetails ? (
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Columns</h4>
                                  <div className="text-xs">
                                    <div className="grid grid-cols-3 gap-2 font-medium mb-1">
                                      <div>Name</div>
                                      <div>Type</div>
                                      <div>Nullable</div>
                                    </div>
                                    {tableDetails.columns.map((column: any) => (
                                      <div key={column.column_name} className="grid grid-cols-3 gap-2">
                                        <div>{column.column_name}</div>
                                        <div>{column.data_type}</div>
                                        <div>{column.is_nullable === "YES" ? "Yes" : "No"}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-sm font-medium">Sample Data</h4>
                                    <Badge variant="outline">{tableDetails.rowCount} rows total</Badge>
                                  </div>

                                  {tableDetails.sampleData.length > 0 ? (
                                    <ScrollArea className="h-40 w-full">
                                      <div className="text-xs">
                                        <div className="grid grid-cols-3 gap-2 font-medium mb-1">
                                          {Object.keys(tableDetails.sampleData[0])
                                            .slice(0, 3)
                                            .map((key) => (
                                              <div key={key}>{key}</div>
                                            ))}
                                        </div>
                                        {tableDetails.sampleData.slice(0, 5).map((row: any, index: number) => (
                                          <div key={index} className="grid grid-cols-3 gap-2">
                                            {Object.values(row)
                                              .slice(0, 3)
                                              .map((value: any, i: number) => (
                                                <div key={i} className="truncate">
                                                  {value === null ? (
                                                    <span className="text-muted-foreground italic">null</span>
                                                  ) : (
                                                    String(value)
                                                  )}
                                                </div>
                                              ))}
                                          </div>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  ) : (
                                    <div className="text-center py-4 text-muted-foreground text-xs">
                                      No data available
                                    </div>
                                  )}
                                </div>

                                <div className="flex justify-end">
                                  <Button variant="outline" size="sm" onClick={() => viewTableData(table.table_name)}>
                                    View Full Data
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">Failed to load table details</div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
