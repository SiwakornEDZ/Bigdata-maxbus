"use client"

import { useState, useEffect } from "react"
import { Copy, Database } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

interface ImportedTable {
  id: number
  name: string
  description: string
}

export function SqlExamples() {
  const { toast } = useToast()
  const [importedTables, setImportedTables] = useState<ImportedTable[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchImportedTables() {
      try {
        setIsLoading(true)
        // ในสถานการณ์จริง เราจะดึงข้อมูลจาก API
        // แต่ในตัวอย่างนี้ เราจะสร้างข้อมูลจำลอง

        // ดึงข้อมูล import jobs เพื่อสร้างรายการตาราง
        const response = await fetch("/api/import-jobs")
        if (!response.ok) {
          throw new Error("Failed to fetch import jobs")
        }

        const importJobs = await response.json()

        // สร้างรายการตารางจาก import jobs
        const tables = importJobs.map((job: any) => ({
          id: job.id,
          name: `imported_data_${job.id}`,
          description: `Data imported from ${job.source_type}: ${job.name}`,
        }))

        setImportedTables(tables)
      } catch (error) {
        console.error("Error fetching imported tables:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImportedTables()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "SQL query copied to clipboard",
    })
  }

  const examples = [
    {
      category: "Basic Queries",
      queries: [
        {
          title: "Select All Data",
          description: "Retrieve all records from an imported data table",
          sql: (tableName: string) => `SELECT * FROM ${tableName} LIMIT 100;`,
        },
        {
          title: "Count Records",
          description: "Count the total number of records in a table",
          sql: (tableName: string) => `SELECT COUNT(*) FROM ${tableName};`,
        },
        {
          title: "Filter JSON Data",
          description: "Filter records based on a JSON property value",
          sql: (tableName: string) => `SELECT * FROM ${tableName} WHERE data->>'name' = 'John Doe';`,
        },
      ],
    },
    {
      category: "Advanced Queries",
      queries: [
        {
          title: "JSON Aggregation",
          description: "Group and count by a JSON property",
          sql: (tableName: string) => `SELECT 
  data->>'age' as age, 
  COUNT(*) 
FROM ${tableName} 
GROUP BY data->>'age' 
ORDER BY age::int;`,
        },
        {
          title: "JSON Path Extraction",
          description: "Extract nested JSON properties",
          sql: (tableName: string) => `SELECT 
  id,
  data->>'name' as name,
  data->>'email' as email,
  (data->>'age')::int as age
FROM ${tableName}
WHERE (data->>'age')::int > 25
ORDER BY age DESC;`,
        },
      ],
    },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">SQL Examples</CardTitle>
        <CardDescription>Example SQL queries to help you get started with analyzing your imported data</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <p className="text-muted-foreground">Loading available tables...</p>
          </div>
        ) : importedTables.length === 0 ? (
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              No imported data tables found. Import data first to see example queries.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="Basic Queries">
            <TabsList className="mb-4">
              {examples.map((category) => (
                <TabsTrigger key={category.category} value={category.category}>
                  {category.category}
                </TabsTrigger>
              ))}
            </TabsList>

            {examples.map((category) => (
              <TabsContent key={category.category} value={category.category} className="space-y-4">
                {importedTables.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Available Tables:</p>
                    <div className="flex flex-wrap gap-2">
                      {importedTables.map((table) => (
                        <div key={table.id} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md">
                          <Database className="h-3 w-3" />
                          <span>{table.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {category.queries.map((query, index) => {
                  const tableName = importedTables.length > 0 ? importedTables[0].name : "imported_data_1"
                  const sqlQuery = query.sql(tableName)

                  return (
                    <div key={index} className="rounded-md border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{query.title}</h3>
                          <p className="text-sm text-muted-foreground">{query.description}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(sqlQuery)}>
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Copy query</span>
                        </Button>
                      </div>
                      <pre className="bg-muted p-2 rounded-md text-xs overflow-x-auto">{sqlQuery}</pre>
                    </div>
                  )
                })}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
