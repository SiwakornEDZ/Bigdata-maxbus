"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, AlertCircle, CheckCircle2, Database, TableIcon, Code } from "lucide-react"

export function TableChecker() {
  const router = useRouter()
  const [tableName, setTableName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [tableSchema, setTableSchema] = useState<any[]>([])
  const [tableData, setTableData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("schema")

  useEffect(() => {
    // ใช้ window.location.search แทน useSearchParams
    const params = new URLSearchParams(window.location.search)
    const tableParam = params.get("table")

    if (tableParam) {
      setTableName(tableParam)
      checkTable(tableParam)
    }
  }, [])

  const checkTable = async (name: string) => {
    if (!name.trim()) {
      setError("Please enter a table name")
      return
    }

    setLoading(true)
    setError(null)
    setTableExists(null)
    setTableSchema([])
    setTableData([])

    try {
      // Check if table exists
      const existsResponse = await fetch(`/api/database/table-exists?table=${encodeURIComponent(name)}`)
      const existsData = await existsResponse.json()

      if (!existsResponse.ok) {
        throw new Error(existsData.error || "Failed to check table existence")
      }

      setTableExists(existsData.exists)

      if (existsData.exists) {
        // Get table schema
        const schemaResponse = await fetch(`/api/database/debug?table=${encodeURIComponent(name)}&type=schema`)
        const schemaData = await schemaResponse.json()

        if (!schemaResponse.ok) {
          throw new Error(schemaData.error || "Failed to get table schema")
        }

        setTableSchema(schemaData)

        // Get sample data
        const dataResponse = await fetch(`/api/database/debug?table=${encodeURIComponent(name)}&type=data&limit=10`)
        const dataData = await dataResponse.json()

        if (!dataResponse.ok) {
          throw new Error(dataData.error || "Failed to get table data")
        }

        setTableData(dataData)
        setActiveTab("schema")
      }
    } catch (err) {
      console.error("Error checking table:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    checkTable(tableName)
  }

  const generateSampleQuery = () => {
    if (!tableExists || tableSchema.length === 0) return ""

    const columns = tableSchema.map((col) => `"${col.column_name}"`).join(", ")
    return `SELECT ${columns}\nFROM "${tableName}"\nLIMIT 100;`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Table Checker</CardTitle>
        <CardDescription>Check if a table exists and view its structure and sample data</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="table-name" className="sr-only">
                Table Name
              </Label>
              <Input
                id="table-name"
                placeholder="Enter table name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Table"
              )}
            </Button>
          </div>
        </form>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {tableExists === false && !loading && !error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Table Not Found</AlertTitle>
            <AlertDescription>The table "{tableName}" does not exist in the database.</AlertDescription>
          </Alert>
        )}

        {tableExists === true && !loading && (
          <div className="space-y-6">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Table Found</AlertTitle>
              <AlertDescription className="text-green-700">
                The table "{tableName}" exists in the database.
              </AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="schema">
                  <Database className="h-4 w-4 mr-2" />
                  Schema
                </TabsTrigger>
                <TabsTrigger value="data">
                  <TableIcon className="h-4 w-4 mr-2" />
                  Sample Data
                </TabsTrigger>
                <TabsTrigger value="query">
                  <Code className="h-4 w-4 mr-2" />
                  Sample Query
                </TabsTrigger>
              </TabsList>

              <TabsContent value="schema" className="mt-4">
                <ScrollArea className="h-[300px] border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Column Name</TableHead>
                        <TableHead>Data Type</TableHead>
                        <TableHead>Nullable</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableSchema.map((column, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{column.column_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{column.data_type}</Badge>
                          </TableCell>
                          <TableCell>
                            {column.is_nullable === "YES" ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-600">
                                Nullable
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-600">
                                Not Null
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="data" className="mt-4">
                {tableData.length > 0 ? (
                  <ScrollArea className="h-[300px] border rounded-md">
                    <div className="p-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(tableData[0]).map((key) => (
                              <TableHead key={key}>{key}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {Object.values(row).map((value: any, colIndex) => (
                                <TableCell key={colIndex}>
                                  {value === null ? (
                                    <span className="text-muted-foreground italic">null</span>
                                  ) : typeof value === "object" ? (
                                    JSON.stringify(value).substring(0, 50)
                                  ) : (
                                    String(value).substring(0, 50)
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center p-8 border rounded-md">
                    <TableIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No data available</h3>
                    <p className="text-sm text-muted-foreground">
                      The table exists but contains no data or we couldn't retrieve sample data.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="query" className="mt-4">
                <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre overflow-x-auto">
                  {generateSampleQuery()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Copy this query to the SQL Editor to view the table data.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">Check database tables and their structure</div>
        {tableExists && (
          <Button variant="outline" asChild>
            <a href={`/sql-editor?query=${encodeURIComponent(`SELECT * FROM "${tableName}" LIMIT 100;`)}`}>
              Query in SQL Editor
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

