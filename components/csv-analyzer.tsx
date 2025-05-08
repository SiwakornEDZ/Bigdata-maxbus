"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, FileText, Upload, CheckCircle2, Info } from "lucide-react"
import { parse } from "csv-parse/sync"

export function CSVAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [csvData, setCsvData] = useState<any[] | null>(null)
  const [csvColumns, setCsvColumns] = useState<string[]>([])
  const [csvStats, setCsvStats] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState("preview")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        setError("Please select a CSV file")
        return
      }

      setFile(selectedFile)
      setError(null)
      analyzeCSV(selectedFile)
    }
  }

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]

      if (!droppedFile.name.toLowerCase().endsWith(".csv")) {
        setError("Please select a CSV file")
        return
      }

      setFile(droppedFile)
      setError(null)
      analyzeCSV(droppedFile)
    }
  }

  // Analyze CSV file
  const analyzeCSV = async (file: File) => {
    setAnalyzing(true)
    setError(null)
    setCsvData(null)
    setCsvColumns([])
    setCsvStats(null)

    try {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string

          // Try different parsing options
          let records = []
          let parseOptions = {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            skip_records_with_error: true,
            relax_column_count: true,
            relax_quotes: true,
            escape: "\\",
          }

          try {
            records = parse(content, parseOptions)
          } catch (error) {
            // Try with different delimiter
            try {
              parseOptions = { ...parseOptions, delimiter: ";" }
              records = parse(content, parseOptions)
            } catch (error2) {
              // Try with different quote character
              try {
                parseOptions = { ...parseOptions, delimiter: ",", quote: "'" }
                records = parse(content, parseOptions)
              } catch (error3) {
                throw new Error("Failed to parse CSV file. Please check the file format.")
              }
            }
          }

          if (records.length === 0) {
            throw new Error("CSV file is empty or has no valid records")
          }

          // Get columns
          const columns = Object.keys(records[0])
          setCsvColumns(columns)

          // Get sample data (first 100 rows)
          setCsvData(records.slice(0, 100))

          // Analyze data
          const stats = analyzeData(records, columns)
          setCsvStats(stats)

          setActiveTab("preview")
        } catch (err) {
          console.error("Error parsing CSV:", err)
          setError(err instanceof Error ? err.message : "Failed to parse CSV file")
        } finally {
          setAnalyzing(false)
        }
      }

      reader.onerror = () => {
        setError("Error reading file")
        setAnalyzing(false)
      }

      reader.readAsText(file)
    } catch (err) {
      console.error("Error analyzing CSV:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setAnalyzing(false)
    }
  }

  // Analyze data and generate statistics
  const analyzeData = (data: any[], columns: string[]) => {
    const stats: Record<string, any> = {}

    columns.forEach((column) => {
      const values = data.map((row) => row[column])
      const nonNullValues = values.filter((v) => v !== null && v !== undefined && v !== "")

      // Count null/empty values
      const nullCount = data.length - nonNullValues.length

      // Determine data type
      let dataType = "unknown"
      let numberCount = 0
      let dateCount = 0
      let booleanCount = 0

      nonNullValues.forEach((value) => {
        // Check if number
        if (!isNaN(Number(value))) {
          numberCount++
        }

        // Check if date
        const datePatterns = [/^\d{4}-\d{2}-\d{2}$/, /^\d{2}\/\d{2}\/\d{4}$/, /^\d{2}-\d{2}-\d{4}$/]
        if (datePatterns.some((pattern) => pattern.test(String(value)))) {
          dateCount++
        }

        // Check if boolean
        const boolValues = ["true", "false", "yes", "no", "y", "n", "1", "0"]
        if (boolValues.includes(String(value).toLowerCase())) {
          booleanCount++
        }
      })

      // Determine most likely type
      if (nonNullValues.length === 0) {
        dataType = "unknown"
      } else if (numberCount / nonNullValues.length > 0.9) {
        dataType = "number"
      } else if (dateCount / nonNullValues.length > 0.9) {
        dataType = "date"
      } else if (booleanCount / nonNullValues.length > 0.9) {
        dataType = "boolean"
      } else {
        dataType = "text"
      }

      // Get unique values count
      const uniqueValues = new Set(values).size

      // Get min/max length for text
      let minLength = Number.POSITIVE_INFINITY
      let maxLength = 0

      if (dataType === "text") {
        nonNullValues.forEach((value) => {
          const length = String(value).length
          minLength = Math.min(minLength, length)
          maxLength = Math.max(maxLength, length)
        })
      }

      // Store stats
      stats[column] = {
        dataType,
        totalValues: data.length,
        nullCount,
        nullPercentage: (nullCount / data.length) * 100,
        uniqueValues,
        uniquePercentage: (uniqueValues / data.length) * 100,
        minLength: dataType === "text" ? minLength : undefined,
        maxLength: dataType === "text" ? maxLength : undefined,
      }
    })

    return stats
  }

  // Remove selected file
  const removeFile = () => {
    setFile(null)
    setCsvData(null)
    setCsvColumns([])
    setCsvStats(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>CSV Analyzer</CardTitle>
        <CardDescription>Analyze CSV files to check for data quality issues before importing</CardDescription>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div
            className={`border-2 ${isDragging ? "border-primary" : "border-dashed"} rounded-lg p-8 text-center transition-colors ${isDragging ? "bg-primary/5" : "hover:bg-muted/50"}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-1">Drag & Drop or Click to Upload</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Upload a CSV file to analyze its structure and data quality
            </p>
            <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-10 w-10 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB • CSV File</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={removeFile}>
                Analyze Another File
              </Button>
            </div>

            {analyzing ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-medium mb-1">Analyzing CSV File</h3>
                <p className="text-sm text-muted-foreground">This may take a moment for larger files...</p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="preview">Data Preview</TabsTrigger>
                  <TabsTrigger value="analysis">Data Analysis</TabsTrigger>
                  <TabsTrigger value="issues">Potential Issues</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="mt-4">
                  {csvData && csvData.length > 0 ? (
                    <ScrollArea className="h-[400px] border rounded-md">
                      <div className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {csvColumns.map((column, i) => (
                                <TableHead key={i}>{column}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {csvData.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {csvColumns.map((column, colIndex) => (
                                  <TableCell key={colIndex}>
                                    {row[column] === null || row[column] === undefined || row[column] === "" ? (
                                      <span className="text-muted-foreground italic">empty</span>
                                    ) : (
                                      String(row[column]).substring(0, 50)
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
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No data available</h3>
                      <p className="text-sm text-muted-foreground">We couldn't parse any data from this CSV file.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="analysis" className="mt-4">
                  {csvStats ? (
                    <ScrollArea className="h-[400px] border rounded-md">
                      <div className="p-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Column Name</TableHead>
                              <TableHead>Data Type</TableHead>
                              <TableHead>Null Values</TableHead>
                              <TableHead>Unique Values</TableHead>
                              <TableHead>Length (Min/Max)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(csvStats).map(([column, stats]: [string, any]) => (
                              <TableRow key={column}>
                                <TableCell className="font-medium">{column}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{stats.dataType}</Badge>
                                </TableCell>
                                <TableCell>
                                  {stats.nullCount} ({stats.nullPercentage.toFixed(1)}%)
                                </TableCell>
                                <TableCell>
                                  {stats.uniqueValues} ({stats.uniquePercentage.toFixed(1)}%)
                                </TableCell>
                                <TableCell>
                                  {stats.dataType === "text" ? `${stats.minLength} / ${stats.maxLength}` : "N/A"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center p-8 border rounded-md">
                      <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No analysis available</h3>
                      <p className="text-sm text-muted-foreground">We couldn't analyze the data from this CSV file.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="issues" className="mt-4">
                  {csvStats ? (
                    <div className="space-y-4">
                      <Alert
                        variant={Object.values(csvStats).some((s) => s.nullPercentage > 0) ? "destructive" : "default"}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Missing Values</AlertTitle>
                        <AlertDescription>
                          {Object.values(csvStats).some((s) => s.nullPercentage > 0)
                            ? `This CSV has columns with missing values. ${Object.entries(csvStats)
                                .filter(([_, s]: [string, any]) => s.nullPercentage > 0)
                                .map(([col, s]: [string, any]) => `"${col}" (${s.nullPercentage.toFixed(1)}%)`)
                                .join(", ")}`
                            : "No missing values detected in this CSV."}
                        </AlertDescription>
                      </Alert>

                      <Alert
                        variant={
                          Object.values(csvStats).some((s) => s.dataType === "unknown") ? "destructive" : "default"
                        }
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Data Type Issues</AlertTitle>
                        <AlertDescription>
                          {Object.values(csvStats).some((s) => s.dataType === "unknown")
                            ? `Some columns have unknown or mixed data types: ${Object.entries(csvStats)
                                .filter(([_, s]: [string, any]) => s.dataType === "unknown")
                                .map(([col]: [string, any]) => `"${col}"`)
                                .join(", ")}`
                            : "All columns have consistent data types."}
                        </AlertDescription>
                      </Alert>

                      <Alert
                        variant={
                          Object.values(csvStats).some((s) => s.uniquePercentage === 100) ? "default" : "destructive"
                        }
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Potential Duplicate Values</AlertTitle>
                        <AlertDescription>
                          {Object.values(csvStats).some((s) => s.uniquePercentage === 100)
                            ? "No duplicate values detected in any column."
                            : "Some columns may contain duplicate values."}
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="text-center p-8 border rounded-md">
                      <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No issues analysis available</h3>
                      <p className="text-sm text-muted-foreground">
                        We couldn't analyze potential issues in this CSV file.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        {csvData && !analyzing && (
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {csvData.length} rows × {csvColumns.length} columns displayed
            </div>
            <Button asChild>
              <a href="/data-import">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Proceed to Import
              </a>
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
