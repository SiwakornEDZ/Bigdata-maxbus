"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Database, Table, ArrowRight, RefreshCw, Save, Play, Plus, Trash2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"

interface TableInfo {
  table_name: string
  column_count: number
  table_size: number
  size_pretty?: string
  is_imported?: boolean
  records_count?: number
  source_type?: string
  type?: string
}

interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
  name?: string
  type?: string
}

interface TableData {
  [key: string]: {
    columns: ColumnInfo[]
    selected: boolean
    selectedColumns: string[]
    joinedWith: { [key: string]: { type: string; on: string } }
  }
}

export function VisualQueryBuilder() {
  const router = useRouter()
  const [tables, setTables] = useState<TableInfo[]>([])
  const [importedTables, setImportedTables] = useState<TableInfo[]>([])
  const [isLoadingTables, setIsLoadingTables] = useState(false)
  const [isRefreshingTables, setIsRefreshingTables] = useState(false)
  const [tableData, setTableData] = useState<TableData>({})
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [joins, setJoins] = useState<any[]>([])
  const [filters, setFilters] = useState<any[]>([])
  const [sortColumn, setSortColumn] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<string>("ASC")
  const [limit, setLimit] = useState<number>(100)
  const [generatedSQL, setGeneratedSQL] = useState<string>("")
  const [queryName, setQueryName] = useState<string>("")
  const [queryDescription, setQueryDescription] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("tables")
  const [isGeneratingSQL, setIsGeneratingSQL] = useState(false)
  const [isExecutingQuery, setIsExecutingQuery] = useState(false)
  const [groupByColumns, setGroupByColumns] = useState<string[]>([])
  const [aggregations, setAggregations] = useState<{ column: string; function: string; alias: string }[]>([])
  const [distinctResults, setDistinctResults] = useState(false)
  const [allTables, setAllTables] = useState<TableInfo[]>([])

  // Form state for joins
  const [joinForm, setJoinForm] = useState({
    leftTable: "",
    rightTable: "",
    type: "INNER JOIN",
    leftColumn: "",
    rightColumn: "",
  })

  // Form state for filters
  const [filterForm, setFilterForm] = useState({
    column: "",
    operator: "=",
    value: "",
  })

  // Form state for aggregations
  const [aggregationForm, setAggregationForm] = useState({
    column: "",
    function: "COUNT",
    alias: "",
  })

  // Fetch tables on component mount
  useEffect(() => {
    fetchTables()
  }, [])

  // Update allTables when either tables or importedTables changes
  useEffect(() => {
    setAllTables([...importedTables, ...tables])
  }, [tables, importedTables])

  const fetchTables = async () => {
    try {
      setIsLoadingTables(true)

      // Fetch system tables
      const tablesResponse = await fetch("/api/database/tables")
      if (!tablesResponse.ok) {
        throw new Error("Failed to fetch tables")
      }
      const tablesData = await tablesResponse.json()

      // Fetch imported tables
      const importedResponse = await fetch("/api/import-jobs?status=completed")
      if (!importedResponse.ok) {
        throw new Error("Failed to fetch imported tables")
      }
      const importedData = await importedResponse.json()

      // Transform imported tables to match the format of system tables
      const transformedImportedTables = importedData.map((job: any) => ({
        table_name: job.table_name,
        column_count: 0, // We'll fetch this when the table is selected
        table_size: Number.parseInt(job.file_size) || 0,
        is_imported: true,
        records_count: job.records_count,
        source_type: job.source_type,
      }))

      setTables(tablesData)
      setImportedTables(transformedImportedTables)

      // Initialize tableData for all tables
      const newTableData: TableData = {}

      // Add system tables
      tablesData.forEach((table: TableInfo) => {
        newTableData[table.table_name] = {
          columns: [],
          selected: false,
          selectedColumns: [],
          joinedWith: {},
        }
      })

      // Add imported tables
      transformedImportedTables.forEach((table: TableInfo) => {
        newTableData[table.table_name] = {
          columns: [],
          selected: false,
          selectedColumns: [],
          joinedWith: {},
        }
      })

      setTableData(newTableData)
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
    setIsRefreshingTables(false)
    toast({
      title: "Tables refreshed",
      description: "The table list has been updated",
    })
  }

  const fetchTableColumns = async (tableName: string) => {
    try {
      const response = await fetch(`/api/database/tables/${tableName}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch columns for table ${tableName}`)
      }
      const data = await response.json()

      // Update tableData with columns
      setTableData((prev) => ({
        ...prev,
        [tableName]: {
          ...prev[tableName],
          columns: data.columns || [],
        },
      }))

      return data.columns || []
    } catch (error) {
      console.error(`Error fetching columns for table ${tableName}:`, error)
      toast({
        title: "Error",
        description: `Failed to load columns for table ${tableName}`,
        variant: "destructive",
      })
      return []
    }
  }

  const toggleTableSelection = async (tableName: string) => {
    // If table is already selected, remove it
    if (selectedTables.includes(tableName)) {
      setSelectedTables((prev) => prev.filter((t) => t !== tableName))

      // Update tableData
      setTableData((prev) => ({
        ...prev,
        [tableName]: {
          ...prev[tableName],
          selected: false,
          selectedColumns: [],
        },
      }))

      // Remove any joins involving this table
      setJoins((prev) => prev.filter((join) => join.leftTable !== tableName && join.rightTable !== tableName))

      // Remove any filters involving this table
      setFilters((prev) => prev.filter((filter) => filter.table !== tableName))

      return
    }

    // If table is not selected, add it
    setSelectedTables((prev) => [...prev, tableName])

    // Update tableData
    setTableData((prev) => ({
      ...prev,
      [tableName]: {
        ...prev[tableName],
        selected: true,
      },
    }))

    // Fetch columns if not already fetched
    if (!tableData[tableName].columns || tableData[tableName].columns.length === 0) {
      await fetchTableColumns(tableName)
    }
  }

  const toggleColumnSelection = (tableName: string, columnName: string) => {
    setTableData((prev) => {
      const table = prev[tableName]
      const selectedColumns = table.selectedColumns || []

      // Toggle column selection
      const newSelectedColumns = selectedColumns.includes(columnName)
        ? selectedColumns.filter((c) => c !== columnName)
        : [...selectedColumns, columnName]

      return {
        ...prev,
        [tableName]: {
          ...table,
          selectedColumns: newSelectedColumns,
        },
      }
    })
  }

  const handleJoinFormChange = (field: string, value: string) => {
    setJoinForm((prev) => ({
      ...prev,
      [field]: value,
    }))

    // If left table changes, reset left column
    if (field === "leftTable") {
      setJoinForm((prev) => ({
        ...prev,
        leftColumn: "",
      }))
    }

    // If right table changes, reset right column
    if (field === "rightTable") {
      setJoinForm((prev) => ({
        ...prev,
        rightColumn: "",
      }))
    }
  }

  const handleAddJoin = () => {
    const { leftTable, rightTable, type, leftColumn, rightColumn } = joinForm

    if (!leftTable || !rightTable || !leftColumn || !rightColumn) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields for the join",
        variant: "destructive",
      })
      return
    }

    // Add join
    setJoins((prev) => [
      ...prev,
      {
        leftTable,
        rightTable,
        type,
        leftColumn: leftColumn.split(".")[1] || leftColumn,
        rightColumn: rightColumn.split(".")[1] || rightColumn,
      },
    ])

    // Reset form
    setJoinForm({
      leftTable: "",
      rightTable: "",
      type: "INNER JOIN",
      leftColumn: "",
      rightColumn: "",
    })

    toast({
      title: "Join added",
      description: `Added ${type} between ${leftTable} and ${rightTable}`,
    })
  }

  const handleFilterFormChange = (field: string, value: string) => {
    setFilterForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddFilter = () => {
    const { column, operator, value } = filterForm

    if (!column) {
      toast({
        title: "Missing fields",
        description: "Please select a column for the filter",
        variant: "destructive",
      })
      return
    }

    // For IS NULL and IS NOT NULL, value is not required
    if (operator !== "IS NULL" && operator !== "IS NOT NULL" && !value) {
      toast({
        title: "Missing fields",
        description: "Please enter a value for the filter",
        variant: "destructive",
      })
      return
    }

    const [table, columnName] = column.split(".")

    // Add filter
    setFilters((prev) => [...prev, { table, column: columnName, operator, value }])

    // Reset form
    setFilterForm({
      column: "",
      operator: "=",
      value: "",
    })

    toast({
      title: "Filter added",
      description: `Added filter on ${column}`,
    })
  }

  const handleAggregationFormChange = (field: string, value: string) => {
    setAggregationForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddAggregation = () => {
    const { column, function: func, alias } = aggregationForm

    if (!column || !func) {
      toast({
        title: "Missing fields",
        description: "Please select a column and function for the aggregation",
        variant: "destructive",
      })
      return
    }

    // Add aggregation
    setAggregations((prev) => [...prev, { column, function: func, alias }])

    // Reset form
    setAggregationForm({
      column: "",
      function: "COUNT",
      alias: "",
    })

    toast({
      title: "Aggregation added",
      description: `Added ${func} on ${column}`,
    })
  }

  const toggleGroupByColumn = (column: string) => {
    setGroupByColumns((prev) => (prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]))
  }

  const generateSQL = () => {
    if (selectedTables.length === 0) {
      toast({
        title: "No tables selected",
        description: "Please select at least one table",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingSQL(true)

    try {
      // Start building the SQL query
      let sql = "SELECT "

      // Add DISTINCT if selected
      if (distinctResults) {
        sql += "DISTINCT "
      }

      // Add selected columns
      const selectedColumns: string[] = []

      // First add any aggregations
      if (aggregations.length > 0) {
        aggregations.forEach((agg) => {
          const [table, column] = agg.column.split(".")
          selectedColumns.push(
            `${agg.function}("${table}"."${column}") AS ${agg.alias || agg.function.toLowerCase() + "_" + column}`,
          )
        })
      }

      // Then add regular columns
      selectedTables.forEach((tableName) => {
        const table = tableData[tableName]
        if (table.selectedColumns && table.selectedColumns.length > 0) {
          table.selectedColumns.forEach((columnName) => {
            // Skip columns that are used in aggregations if we have group by
            if (groupByColumns.length > 0 && !groupByColumns.includes(`${tableName}.${columnName}`)) {
              const isAggregated = aggregations.some((agg) => agg.column === `${tableName}.${columnName}`)
              if (!isAggregated) {
                return
              }
            }
            selectedColumns.push(`"${tableName}"."${columnName}"`)
          })
        }
      })

      // If no columns are selected, use *
      if (selectedColumns.length === 0) {
        selectedTables.forEach((tableName) => {
          selectedColumns.push(`"${tableName}".*`)
        })
      }

      sql += selectedColumns.join(", ")

      // Add FROM clause
      if (selectedTables.length > 0) {
        sql += `
FROM "${selectedTables[0]}"`

        // Add JOINs
        joins.forEach((join) => {
          sql += `
${join.type} JOIN "${join.rightTable}" ON "${join.leftTable}"."${join.leftColumn}" = "${join.rightTable}"."${join.rightColumn}"`
        })
      } else {
        throw new Error("No tables selected")
      }

      // Add WHERE clause for filters
      if (filters.length > 0) {
        sql += "\nWHERE "
        const filterClauses = filters.map((filter) => {
          let value = filter.value

          // Add quotes for string values
          if (isNaN(Number(value)) && value !== "NULL" && value !== "NOT NULL") {
            value = `'${value}'`
          }

          // Handle special operators
          if (filter.operator === "IS NULL") {
            return `"${filter.table}"."${filter.column}" IS NULL`
          } else if (filter.operator === "IS NOT NULL") {
            return `"${filter.table}"."${filter.column}" IS NOT NULL`
          } else if (filter.operator === "IN") {
            // Split comma-separated values and wrap in quotes if needed
            const values = value.split(",").map((v) => {
              v = v.trim()
              return isNaN(Number(v)) ? `'${v}'` : v
            })
            return `"${filter.table}"."${filter.column}" IN (${values.join(", ")})`
          } else if (filter.operator === "BETWEEN") {
            // Split range values
            const [min, max] = value.split(",").map((v) => v.trim())
            return `"${filter.table}"."${filter.column}" BETWEEN ${min} AND ${max}`
          } else {
            return `"${filter.table}"."${filter.column}" ${filter.operator} ${value}`
          }
        })

        sql += filterClauses.join(" AND ")
      }

      // Add GROUP BY clause
      if (groupByColumns.length > 0) {
        sql += "\nGROUP BY "
        sql += groupByColumns
          .map((col) => {
            const [table, column] = col.split(".")
            return `"${table}"."${column}"`
          })
          .join(", ")
      }

      // Add ORDER BY clause
      if (sortColumn) {
        const [table, column] = sortColumn.split(".")
        sql += `\nORDER BY "${table}"."${column}" ${sortDirection}`
      }

      // Add LIMIT clause
      if (limit > 0) {
        sql += `\nLIMIT ${limit}`
      }

      // Add semicolon
      sql += ";"

      setGeneratedSQL(sql)

      toast({
        title: "SQL Generated",
        description: "Your query has been generated successfully",
      })

      // Switch to SQL tab
      setActiveTab("sql")
    } catch (error) {
      console.error("Error generating SQL:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate SQL",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingSQL(false)
    }
  }

  const executeQuery = async () => {
    if (!generatedSQL) {
      toast({
        title: "Error",
        description: "Please generate SQL query first",
        variant: "destructive",
      })
      return
    }

    setIsExecutingQuery(true)

    try {
      // Save query to localStorage for SQL Editor to use
      localStorage.setItem("lastImportQuery", generatedSQL)

      // Redirect to SQL Editor
      router.push("/sql-editor?import=true")
    } catch (error) {
      console.error("Error executing query:", error)
      toast({
        title: "Error",
        description: "Failed to execute query",
        variant: "destructive",
      })
    } finally {
      setIsExecutingQuery(false)
    }
  }

  const saveQuery = async () => {
    if (!generatedSQL) {
      toast({
        title: "Error",
        description: "Please generate SQL query first",
        variant: "destructive",
      })
      return
    }

    if (!queryName) {
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
          query: generatedSQL,
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const removeJoin = (index: number) => {
    setJoins((prev) => prev.filter((_, i) => i !== index))
  }

  const removeFilter = (index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index))
  }

  const removeAggregation = (index: number) => {
    setAggregations((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Visual Query Builder</CardTitle>
            <CardDescription>Build SQL queries visually by selecting tables, columns, and conditions</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={refreshTables} disabled={isRefreshingTables}>
            {isRefreshingTables ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            <span className="ml-2">Refresh Tables</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="columns">Columns</TabsTrigger>
            <TabsTrigger value="joins">Joins</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="sort">Sort & Limit</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="sql">Generated SQL</TabsTrigger>
          </TabsList>

          <TabsContent value="tables" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Select Tables</h3>
            </div>

            {isLoadingTables ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : allTables.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No tables found in the database</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Imported Tables Section */}
                {importedTables.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium mb-3">Imported Tables</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {importedTables.map((table) => (
                        <Card
                          key={table.table_name}
                          className={`overflow-hidden cursor-pointer transition-colors ${
                            selectedTables.includes(table.table_name) ? "border-primary" : ""
                          }`}
                          onClick={() => toggleTableSelection(table.table_name)}
                        >
                          <CardHeader className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <CardTitle className="text-base flex items-center">
                                  <Table className="h-4 w-4 mr-2" />
                                  {table.table_name}
                                </CardTitle>
                                <CardDescription>
                                  {table.records_count} records • {formatBytes(table.table_size)}
                                </CardDescription>
                              </div>
                              <Checkbox
                                checked={selectedTables.includes(table.table_name)}
                                onCheckedChange={() => toggleTableSelection(table.table_name)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="text-xs text-muted-foreground">
                              <div>Imported table • {table.source_type}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* System Tables Section */}
                <div>
                  <h4 className="text-md font-medium mb-3">System Tables</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tables.map((table) => (
                      <Card
                        key={table.table_name}
                        className={`overflow-hidden cursor-pointer transition-colors ${
                          selectedTables.includes(table.table_name) ? "border-primary" : ""
                        }`}
                        onClick={() => toggleTableSelection(table.table_name)}
                      >
                        <CardHeader className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <CardTitle className="text-base flex items-center">
                                <Table className="h-4 w-4 mr-2" />
                                {table.table_name}
                              </CardTitle>
                              <CardDescription>
                                {table.column_count} columns • {formatBytes(table.table_size)}
                              </CardDescription>
                            </div>
                            <Checkbox
                              checked={selectedTables.includes(table.table_name)}
                              onCheckedChange={() => toggleTableSelection(table.table_name)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button onClick={() => setActiveTab("columns")} disabled={selectedTables.length === 0}>
                Next: Select Columns
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="columns" className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Select Columns</h3>

            {selectedTables.length === 0 ? (
              <div className="text-center py-8">
                <Table className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  No tables selected. Please go back and select tables first.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("tables")}>
                  Go to Tables
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {selectedTables.map((tableName) => {
                  const table = tableData[tableName]
                  return (
                    <Card key={tableName} className="overflow-hidden">
                      <CardHeader className="p-4">
                        <CardTitle className="text-base flex items-center">
                          <Table className="h-4 w-4 mr-2" />
                          {tableName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        {table.columns && table.columns.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {table.columns.map((column) => (
                              <div key={column.column_name || column.name} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${tableName}-${column.column_name || column.name}`}
                                  checked={table.selectedColumns?.includes(column.column_name || column.name)}
                                  onCheckedChange={() =>
                                    toggleColumnSelection(tableName, column.column_name || column.name)
                                  }
                                />
                                <Label
                                  htmlFor={`${tableName}-${column.column_name || column.name}`}
                                  className="flex items-center justify-between w-full cursor-pointer"
                                >
                                  <span>{column.column_name || column.name}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {column.data_type || column.type}
                                  </Badge>
                                </Label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex justify-center items-center h-20">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("tables")}>
                Back: Tables
              </Button>
              <Button onClick={() => setActiveTab("joins")}>
                Next: Define Joins
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="joins" className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Define Joins</h3>

            {selectedTables.length < 2 ? (
              <div className="text-center py-8">
                <ArrowRight className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">You need at least two tables to define joins.</p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("tables")}>
                  Go to Tables
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add New Join</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="leftTable">Left Table</Label>
                        <Select
                          value={joinForm.leftTable}
                          onValueChange={(value) => handleJoinFormChange("leftTable", value)}
                        >
                          <SelectTrigger id="leftTable">
                            <SelectValue placeholder="Select table" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedTables.map((tableName) => (
                              <SelectItem key={tableName} value={tableName}>
                                {tableName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="joinType">Join Type</Label>
                        <Select value={joinForm.type} onValueChange={(value) => handleJoinFormChange("type", value)}>
                          <SelectTrigger id="joinType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INNER JOIN">INNER JOIN</SelectItem>
                            <SelectItem value="LEFT JOIN">LEFT JOIN</SelectItem>
                            <SelectItem value="RIGHT JOIN">RIGHT JOIN</SelectItem>
                            <SelectItem value="FULL JOIN">FULL JOIN</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rightTable">Right Table</Label>
                        <Select
                          value={joinForm.rightTable}
                          onValueChange={(value) => handleJoinFormChange("rightTable", value)}
                        >
                          <SelectTrigger id="rightTable">
                            <SelectValue placeholder="Select table" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedTables
                              .filter((t) => t !== joinForm.leftTable)
                              .map((tableName) => (
                                <SelectItem key={tableName} value={tableName}>
                                  {tableName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="leftColumn">Left Column</Label>
                        <Select
                          value={joinForm.leftColumn}
                          onValueChange={(value) => handleJoinFormChange("leftColumn", value)}
                          disabled={!joinForm.leftTable}
                        >
                          <SelectTrigger id="leftColumn">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {joinForm.leftTable &&
                              tableData[joinForm.leftTable]?.columns?.map((column) => (
                                <SelectItem
                                  key={`${joinForm.leftTable}.${column.column_name || column.name}`}
                                  value={`${joinForm.leftTable}.${column.column_name || column.name}`}
                                >
                                  {column.column_name || column.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rightColumn">Right Column</Label>
                        <Select
                          value={joinForm.rightColumn}
                          onValueChange={(value) => handleJoinFormChange("rightColumn", value)}
                          disabled={!joinForm.rightTable}
                        >
                          <SelectTrigger id="rightColumn">
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {joinForm.rightTable &&
                              tableData[joinForm.rightTable]?.columns?.map((column) => (
                                <SelectItem
                                  key={`${joinForm.rightTable}.${column.column_name || column.name}`}
                                  value={`${joinForm.rightTable}.${column.column_name || column.name}`}
                                >
                                  {column.column_name || column.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      className="mt-4"
                      onClick={handleAddJoin}
                      disabled={
                        !joinForm.leftTable || !joinForm.rightTable || !joinForm.leftColumn || !joinForm.rightColumn
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Join
                    </Button>
                  </CardContent>
                </Card>

                <div>
                  <h4 className="text-md font-medium mb-3">Current Joins</h4>
                  {joins.length === 0 ? (
                    <div className="text-center py-4 border rounded-md">
                      <p className="text-muted-foreground">No joins defined yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {joins.map((join, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <span className="font-medium">
                              {join.leftTable}.{join.leftColumn}
                            </span>
                            <span className="mx-2 text-muted-foreground">{join.type}</span>
                            <span className="font-medium">
                              {join.rightTable}.{join.rightColumn}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => removeJoin(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("columns")}>
                Back: Columns
              </Button>
              <Button onClick={() => setActiveTab("filters")}>
                Next: Add Filters
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Add Filters</h3>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add New Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="filterColumn">Column</Label>
                    <Select
                      value={filterForm.column}
                      onValueChange={(value) => handleFilterFormChange("column", value)}
                    >
                      <SelectTrigger id="filterColumn">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedTables.map((tableName) =>
                          tableData[tableName]?.columns?.map((column) => (
                            <SelectItem
                              key={`${tableName}.${column.column_name || column.name}`}
                              value={`${tableName}.${column.column_name || column.name}`}
                            >
                              {`${tableName}.${column.column_name || column.name}`}
                            </SelectItem>
                          )),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filterOperator">Operator</Label>
                    <Select
                      value={filterForm.operator}
                      onValueChange={(value) => handleFilterFormChange("operator", value)}
                    >
                      <SelectTrigger id="filterOperator">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="=">=</SelectItem>
                        <SelectItem value="!=">!=</SelectItem>
                        <SelectItem value=">">{">"}</SelectItem>
                        <SelectItem value=">=">{">="}</SelectItem>
                        <SelectItem value="<">{"<"}</SelectItem>
                        <SelectItem value="<=">{"<="}</SelectItem>
                        <SelectItem value="LIKE">LIKE</SelectItem>
                        <SelectItem value="NOT LIKE">NOT LIKE</SelectItem>
                        <SelectItem value="IN">IN</SelectItem>
                        <SelectItem value="NOT IN">NOT IN</SelectItem>
                        <SelectItem value="IS NULL">IS NULL</SelectItem>
                        <SelectItem value="IS NOT NULL">IS NOT NULL</SelectItem>
                        <SelectItem value="BETWEEN">BETWEEN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="filterValue">Value</Label>
                    <Input
                      id="filterValue"
                      placeholder="Enter value"
                      value={filterForm.value}
                      onChange={(e) => handleFilterFormChange("value", e.target.value)}
                      disabled={filterForm.operator === "IS NULL" || filterForm.operator === "IS NOT NULL"}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      For IN, use comma-separated values. For BETWEEN, use min,max format.
                    </p>
                  </div>
                </div>

                <Button
                  className="mt-4"
                  onClick={handleAddFilter}
                  disabled={
                    !filterForm.column ||
                    (filterForm.operator !== "IS NULL" && filterForm.operator !== "IS NOT NULL" && !filterForm.value)
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Filter
                </Button>
              </CardContent>
            </Card>

            <div>
              <h4 className="text-md font-medium mb-3">Current Filters</h4>
              {filters.length === 0 ? (
                <div className="text-center py-4 border rounded-md">
                  <p className="text-muted-foreground">No filters defined yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filters.map((filter, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <span className="font-medium">
                          {filter.table}.{filter.column}
                        </span>
                        <span className="mx-2 text-muted-foreground">{filter.operator}</span>
                        <span className="font-medium">{filter.value}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeFilter(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("joins")}>
                Back: Joins
              </Button>
              <Button onClick={() => setActiveTab("sort")}>
                Next: Sort & Limit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sort" className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Sort & Limit Results</h3>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sort Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sortColumn">Sort By</Label>
                    <Select value={sortColumn} onValueChange={setSortColumn}>
                      <SelectTrigger id="sortColumn">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {selectedTables.map((tableName) =>
                          tableData[tableName]?.columns?.map((column) => (
                            <SelectItem
                              key={`${tableName}.${column.column_name || column.name}`}
                              value={`${tableName}.${column.column_name || column.name}`}
                            >
                              {`${tableName}.${column.column_name || column.name}`}
                            </SelectItem>
                          )),
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortDirection">Direction</Label>
                    <Select value={sortDirection} onValueChange={setSortDirection} disabled={!sortColumn}>
                      <SelectTrigger id="sortDirection">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASC">Ascending</SelectItem>
                        <SelectItem value="DESC">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Limit Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="limitResults">Maximum number of rows</Label>
                  <Input
                    id="limitResults"
                    type="number"
                    min="1"
                    value={limit}
                    onChange={(e) => setLimit(Number.parseInt(e.target.value) || 100)}
                  />
                  <p className="text-xs text-muted-foreground">Limit the number of rows returned by the query</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("filters")}>
                Back: Filters
              </Button>
              <Button onClick={() => setActiveTab("advanced")}>
                Next: Advanced Options
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Advanced Options</h3>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Result Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch id="distinctResults" checked={distinctResults} onCheckedChange={setDistinctResults} />
                  <Label htmlFor="distinctResults">Return distinct results only</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Aggregations & Grouping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Add Aggregation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="aggColumn">Column</Label>
                      <Select
                        value={aggregationForm.column}
                        onValueChange={(value) => handleAggregationFormChange("column", value)}
                      >
                        <SelectTrigger id="aggColumn">
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedTables.map((tableName) =>
                            tableData[tableName]?.columns?.map((column) => (
                              <SelectItem
                                key={`${tableName}.${column.column_name || column.name}`}
                                value={`${tableName}.${column.column_name || column.name}`}
                              >
                                {`${tableName}.${column.column_name || column.name}`}
                              </SelectItem>
                            )),
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aggFunction">Function</Label>
                      <Select
                        value={aggregationForm.function}
                        onValueChange={(value) => handleAggregationFormChange("function", value)}
                      >
                        <SelectTrigger id="aggFunction">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COUNT">COUNT</SelectItem>
                          <SelectItem value="SUM">SUM</SelectItem>
                          <SelectItem value="AVG">AVG</SelectItem>
                          <SelectItem value="MIN">MIN</SelectItem>
                          <SelectItem value="MAX">MAX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aggAlias">Alias (Optional)</Label>
                      <Input
                        id="aggAlias"
                        placeholder="Column alias"
                        value={aggregationForm.alias}
                        onChange={(e) => handleAggregationFormChange("alias", e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    className="mt-4"
                    onClick={handleAddAggregation}
                    disabled={!aggregationForm.column || !aggregationForm.function}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Aggregation
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Current Aggregations</h4>
                  {aggregations.length === 0 ? (
                    <div className="text-center py-4 border rounded-md">
                      <p className="text-muted-foreground">No aggregations defined yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {aggregations.map((agg, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <span className="font-medium">
                              {agg.function}({agg.column})
                            </span>
                            {agg.alias && <span className="ml-2 text-muted-foreground">AS {agg.alias}</span>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => removeAggregation(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium mb-2">Group By</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Select columns to group by when using aggregations
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedTables.map((tableName) =>
                      tableData[tableName]?.columns?.map((column) => {
                        const columnId = `${tableName}.${column.column_name || column.name}`
                        return (
                          <div key={columnId} className="flex items-center space-x-2">
                            <Checkbox
                              id={`groupby-${columnId}`}
                              checked={groupByColumns.includes(columnId)}
                              onCheckedChange={() => toggleGroupByColumn(columnId)}
                            />
                            <Label htmlFor={`groupby-${columnId}`}>{columnId}</Label>
                          </div>
                        )
                      }),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("sort")}>
                Back: Sort & Limit
              </Button>
              <Button onClick={generateSQL} disabled={selectedTables.length === 0}>
                Generate SQL
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sql" className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Generated SQL</h3>

            <div className="flex justify-end mb-4">
              <Button onClick={generateSQL} disabled={isGeneratingSQL || selectedTables.length === 0}>
                {isGeneratingSQL ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate SQL
                  </>
                )}
              </Button>
            </div>

            <Card>
              <CardContent className="p-4">
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {generatedSQL || "Click 'Generate SQL' to create your query"}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setActiveTab("advanced")}>
                Back: Advanced Options
              </Button>
              <div className="space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={!generatedSQL}>
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
                        <Label htmlFor="queryName">Query Name</Label>
                        <Input
                          id="queryName"
                          placeholder="Enter a name for your query"
                          value={queryName}
                          onChange={(e) => setQueryName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="queryDescription">Description (Optional)</Label>
                        <Input
                          id="queryDescription"
                          placeholder="Enter a description"
                          value={queryDescription}
                          onChange={(e) => setQueryDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={saveQuery} disabled={isSaving || !queryName}>
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

                <Button onClick={executeQuery} disabled={!generatedSQL || isExecutingQuery}>
                  {isExecutingQuery ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute in SQL Editor
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/import")}>
          Import New Data
        </Button>
        {activeTab !== "sql" && selectedTables.length > 0 && (
          <Button onClick={generateSQL} disabled={isGeneratingSQL}>
            {isGeneratingSQL ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate SQL
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
