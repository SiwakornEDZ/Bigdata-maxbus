"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  File,
  X,
  FileText,
  Table,
  Eye,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Info,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

interface FileWithPreview extends File {
  preview?: string
  detectedType?: string
}

export function DataImportForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [sourceType, setSourceType] = useState("")
  const [file, setFile] = useState<FileWithPreview | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any[] | null>(null)
  const [previewColumns, setPreviewColumns] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("upload")
  const [isDragging, setIsDragging] = useState(false)
  const [autoDetect, setAutoDetect] = useState(true)
  const [autoImport, setAutoImport] = useState(false)
  const [autoClean, setAutoClean] = useState(true)
  const [importResult, setImportResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detect file type from extension
  const detectFileType = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() || ""

    switch (extension) {
      case "csv":
        return "csv"
      case "json":
        return "json"
      case "xlsx":
      case "xls":
        return "excel"
      case "parquet":
        return "parquet"
      case "avro":
        return "avro"
      default:
        return ""
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0] as FileWithPreview

      if (autoDetect) {
        const detectedType = detectFileType(selectedFile.name)
        selectedFile.detectedType = detectedType
        setSourceType(detectedType)
      }

      setFile(selectedFile)
      setError(null)
      generatePreview(selectedFile)

      // Auto-generate name from filename if empty
      if (!name) {
        const fileName = selectedFile.name.split(".")[0]
        setName(fileName.replace(/[_-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()))
      }
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
      const droppedFile = e.dataTransfer.files[0] as FileWithPreview

      if (autoDetect) {
        const detectedType = detectFileType(droppedFile.name)
        droppedFile.detectedType = detectedType
        setSourceType(detectedType)
      }

      setFile(droppedFile)
      setError(null)
      generatePreview(droppedFile)

      // Auto-generate name from filename if empty
      if (!name) {
        const fileName = droppedFile.name.split(".")[0]
        setName(fileName.replace(/[_-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()))
      }

      // Auto import if enabled
      if (autoImport) {
        setTimeout(() => {
          handleSubmit(new Event("auto") as any)
        }, 500)
      }
    }
  }

  // Generate preview data from file
  const generatePreview = useCallback(
    async (file: File) => {
      try {
        const reader = new FileReader()

        reader.onload = (e) => {
          const content = e.target?.result as string

          // Detect file type if not already set
          const fileType = sourceType || detectFileType(file.name)

          if (fileType === "csv") {
            // Parse CSV
            const lines = content.split("\n")
            if (lines.length > 0) {
              const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
              setPreviewColumns(headers)

              const previewRows = []
              for (let i = 1; i < Math.min(lines.length, 6); i++) {
                if (lines[i].trim()) {
                  const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
                  const row: Record<string, string> = {}
                  headers.forEach((header, index) => {
                    row[header] = values[index] || ""
                  })
                  previewRows.push(row)
                }
              }
              setPreviewData(previewRows)
            }
          } else if (fileType === "json") {
            // Parse JSON
            try {
              const jsonData = JSON.parse(content)
              if (Array.isArray(jsonData) && jsonData.length > 0) {
                setPreviewColumns(Object.keys(jsonData[0]))
                setPreviewData(jsonData.slice(0, 5))
              }
            } catch (err) {
              console.error("Error parsing JSON:", err)
            }
          }

          // Switch to preview tab
          setActiveTab("preview")
        }

        reader.readAsText(file)
      } catch (err) {
        console.error("Error generating preview:", err)
      }
    },
    [sourceType],
  )

  // Form validation
  const validateForm = () => {
    if (!name.trim()) {
      setError("Please enter a name for this import")
      return false
    }

    if (!file) {
      setError("Please select a file to import")
      return false
    }

    if (!sourceType) {
      setError("Please select or detect a source type")
      return false
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError(`File size exceeds the maximum limit of 100MB`)
      return false
    }

    // Check file type based on sourceType
    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (
      (sourceType === "csv" && fileExtension !== "csv") ||
      (sourceType === "json" && fileExtension !== "json") ||
      (sourceType === "excel" && !["xlsx", "xls"].includes(fileExtension || "")) ||
      (sourceType === "parquet" && fileExtension !== "parquet") ||
      (sourceType === "avro" && fileExtension !== "avro")
    ) {
      setError(`Selected file doesn't match the source type ${sourceType}`)
      return false
    }

    setError(null)
    return true
  }

  // Add to data schemas
  const addToDataSchemas = async (importId: number, tableName: string, fileContent: string) => {
    try {
      // For CSV, try to parse the first few lines to get column names and types
      if (sourceType === "csv") {
        const lines = fileContent.split("\n")
        if (lines.length > 0) {
          const headers = lines[0].split(",").map((header) => header.trim().replace(/"/g, ""))

          // Try to determine types from the first data row
          const types = []
          if (lines.length > 1) {
            const firstDataRow = lines[1].split(",").map((val) => val.trim().replace(/"/g, ""))
            for (let i = 0; i < headers.length; i++) {
              const value = firstDataRow[i] || ""
              // Simple type inference
              if (!isNaN(Number(value))) {
                types.push("numeric")
              } else if (value.match(/^\d{4}-\d{2}-\d{2}/) || value.match(/^\d{2}\/\d{2}\/\d{4}/)) {
                types.push("timestamp")
              } else {
                types.push("text")
              }
            }
          } else {
            // Default to text if no data row
            headers.forEach(() => types.push("text"))
          }

          // Create schema entry
          const columns = headers.map((header, index) => ({
            name: header,
            type: types[index],
            nullable: true,
          }))

          await fetch("/api/data-schemas", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              importId,
              tableName,
              columns,
              sourceType,
            }),
          })
        }
      } else if (sourceType === "json") {
        try {
          const jsonData = JSON.parse(fileContent)
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            const firstItem = jsonData[0]
            const columns = Object.keys(firstItem).map((key) => {
              const value = firstItem[key]
              let type = "text"

              if (typeof value === "number") {
                type = "numeric"
              } else if (
                value instanceof Date ||
                (typeof value === "string" &&
                  (value.match(/^\d{4}-\d{2}-\d{2}/) || value.match(/^\d{2}\/\d{2}\/\d{4}/)))
              ) {
                type = "timestamp"
              }

              return {
                name: key,
                type,
                nullable: true,
              }
            })

            await fetch("/api/data-schemas", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                importId,
                tableName,
                columns,
                sourceType,
              }),
            })
          }
        } catch (err) {
          console.error("Error parsing JSON for schema:", err)
        }
      }
    } catch (err) {
      console.error("Error adding to data schemas:", err)
      // Non-critical error, don't throw
    }
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)
    setSuccess(null)
    setImportResult(null)

    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("sourceType", sourceType)
      formData.append("autoClean", String(autoClean))
      if (file) {
        formData.append("file", file)
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 300)

      // Read file content for schema detection
      const fileReader = new FileReader()
      fileReader.onload = async (event) => {
        const fileContent = event.target?.result as string

        // Send the import job request
        const response = await fetch("/api/import-jobs", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create import job")
        }

        const data = await response.json()
        setImportResult(data)

        // Add to data schemas for query builder
        await addToDataSchemas(data.id, data.tableName, fileContent)

        setUploadProgress(100)
        setSuccess(`Import job "${name}" created successfully`)

        // Create SQL query for viewing the imported data
        const viewDataQuery = `SELECT * FROM ${data.tableName} LIMIT 100;`
        localStorage.setItem("lastImportQuery", viewDataQuery)

        // Show results tab
        setActiveTab("results")
      }

      fileReader.readAsText(file as Blob)
    } catch (err) {
      console.error("Error creating import job:", err)
      setError(err instanceof Error ? err.message : "Failed to create import job")
      setIsUploading(false)
    }
  }

  // Remove selected file
  const removeFile = () => {
    setFile(null)
    setPreviewData(null)
    setPreviewColumns([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>
              Import data from various sources into the platform for analysis and processing.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/csv-analyzer">
                <FileText className="h-4 w-4 mr-2" />
                CSV Analyzer
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/table-checker">
                <Table className="h-4 w-4 mr-2" />
                Table Checker
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="preview" disabled={!file}>
              Preview
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="results" disabled={!importResult}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter a name for this import"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter a description for this import"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="source-type">
                    Source Type{" "}
                    {autoDetect && (
                      <Badge variant="outline" className="ml-2">
                        Auto-detected
                      </Badge>
                    )}
                  </Label>
                  <Select value={sourceType} onValueChange={setSourceType}>
                    <SelectTrigger id="source-type">
                      <SelectValue placeholder="Select source type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="json">JSON File</SelectItem>
                      <SelectItem value="excel">Excel File</SelectItem>
                      <SelectItem value="parquet">Parquet File</SelectItem>
                      <SelectItem value="avro">Avro File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>File Upload</Label>
                  <div
                    className={`border-2 ${isDragging ? "border-primary" : "border-dashed"} rounded-lg p-8 text-center transition-colors ${file ? "bg-muted/30" : isDragging ? "bg-primary/5" : "hover:bg-muted/50"}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".csv,.json,.xlsx,.xls,.parquet,.avro"
                      className="hidden"
                    />

                    {!file ? (
                      <>
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-1">Drag & Drop or Click to Upload</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Support for CSV, JSON, Excel, Parquet and Avro files
                        </p>
                        <p className="text-xs text-muted-foreground">Maximum file size: 100MB</p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-2">
                          {sourceType === "csv" ? (
                            <FileText className="h-10 w-10 text-primary" />
                          ) : sourceType === "json" ? (
                            <File className="h-10 w-10 text-primary" />
                          ) : (
                            <File className="h-10 w-10 text-primary" />
                          )}
                          <div className="text-left">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || "Unknown type"}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile()
                          }}
                          className="mt-2"
                        >
                          <X className="h-4 w-4 mr-2" /> Remove File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-clean" checked={autoClean} onCheckedChange={setAutoClean} />
                  <Label htmlFor="auto-clean" className="flex items-center gap-2">
                    Auto-clean data
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p>When enabled, the system will automatically clean and normalize data during import:</p>
                          <ul className="list-disc pl-4 mt-1 text-xs">
                            <li>Fix column names (remove spaces, special characters)</li>
                            <li>Convert data to appropriate types</li>
                            <li>Handle null values and empty strings</li>
                            <li>Fix date and timestamp formats</li>
                            <li>Normalize boolean values (yes/no, true/false, 1/0)</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="preview">
            {previewData && previewData.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Data Preview</h3>
                  <Badge variant="outline">
                    {previewData.length} of {file?.size ? Math.ceil(file.size / 200) : "?"} rows
                  </Badge>
                </div>

                <ScrollArea className="h-[300px] border rounded-md">
                  <div className="p-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          {previewColumns.map((column, i) => (
                            <th key={i} className="text-left p-2 text-sm font-medium">
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, i) => (
                          <tr key={i} className="border-b last:border-0">
                            {previewColumns.map((column, j) => (
                              <td key={j} className="p-2 text-sm">
                                {row[column] !== undefined ? String(row[column]).substring(0, 50) : ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("upload")}>
                    Back to Upload
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => generatePreview(file!)}>
                      <RefreshCw className="h-4 w-4 mr-2" /> Refresh Preview
                    </Button>
                    <Button onClick={handleSubmit} disabled={isUploading}>
                      <ArrowRight className="h-4 w-4 mr-2" /> Continue to Import
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <Table className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No preview available</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We couldn't generate a preview for this file type or the file is empty.
                </p>
                <Button variant="outline" onClick={() => setActiveTab("upload")}>
                  Back to Upload
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Import Settings</h3>

                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-detect">Auto-detect file type</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically detect the file type based on extension
                    </p>
                  </div>
                  <Switch id="auto-detect" checked={autoDetect} onCheckedChange={setAutoDetect} />
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-import">Auto-import on drop</Label>
                    <p className="text-sm text-muted-foreground">Automatically start import when a file is dropped</p>
                  </div>
                  <Switch id="auto-import" checked={autoImport} onCheckedChange={setAutoImport} />
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-clean">Auto-clean data</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically clean and normalize data during import
                    </p>
                  </div>
                  <Switch id="auto-clean" checked={autoClean} onCheckedChange={setAutoClean} />
                </div>

                <div className="flex items-center justify-between pb-4">
                  <div className="space-y-0.5">
                    <Label>Maximum file size</Label>
                    <p className="text-sm text-muted-foreground">Maximum allowed file size for import</p>
                  </div>
                  <Badge>100 MB</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Supported File Types</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">CSV</p>
                      <p className="text-xs text-muted-foreground">Comma-separated values</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <File className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">JSON</p>
                      <p className="text-xs text-muted-foreground">JavaScript Object Notation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <File className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Excel</p>
                      <p className="text-xs text-muted-foreground">XLSX/XLS spreadsheets</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-md">
                    <File className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Parquet</p>
                      <p className="text-xs text-muted-foreground">Columnar storage format</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results">
            {importResult && (
              <div className="space-y-6">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Import Successful</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Your data has been successfully imported into the database.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-md">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Import Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Table Name:</span>
                        <span className="text-sm font-medium">{importResult.tableName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Records Imported:</span>
                        <span className="text-sm font-medium">{importResult.recordsCount}</span>
                      </div>
                      {importResult.failedRecords > 0 && (
                        <div className="flex justify-between text-amber-600">
                          <span className="text-sm">Failed Records:</span>
                          <span className="text-sm font-medium">{importResult.failedRecords}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {importResult.cleaningStats && (
                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Data Cleaning</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Records:</span>
                          <span className="text-sm font-medium">{importResult.cleaningStats.totalRecords}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Null Values:</span>
                          <span className="text-sm font-medium">{importResult.cleaningStats.nullValues}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Modified Values:</span>
                          <span className="text-sm font-medium">{importResult.cleaningStats.modifiedValues}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <Button variant="outline" asChild>
                    <Link href={`/table-checker?table=${importResult.tableName}`}>
                      <Table className="h-4 w-4 mr-2" />
                      View Table Structure
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/sql-editor?import=true">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Query Data
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && !importResult && (
          <Alert variant="default" className="bg-green-50 text-green-800 border-green-200 mt-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {isUploading && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading and processing...</span>
              <span className="text-sm font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            {uploadProgress >= 50 && uploadProgress < 90 && (
              <p className="text-xs text-muted-foreground animate-pulse">Analyzing and importing data...</p>
            )}
            {uploadProgress >= 90 && (
              <p className="text-xs text-muted-foreground animate-pulse">
                <Sparkles className="h-3 w-3 inline mr-1" />
                Cleaning and normalizing data...
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {activeTab === "upload" && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={() => setActiveTab("preview")} disabled={!file}>
                    <Eye className="h-4 w-4 mr-2" /> Preview Data
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {file ? "View a preview of your data before importing" : "Upload a file first to preview"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button type="submit" onClick={handleSubmit} disabled={isUploading || !file}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                "Import Data"
              )}
            </Button>
          </>
        )}

        {activeTab === "results" && (
          <Button
            onClick={() => {
              setActiveTab("upload")
              setFile(null)
              setPreviewData(null)
              setPreviewColumns([])
              setImportResult(null)
              setSuccess(null)
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            }}
          >
            Import Another File
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
