import { NextResponse } from "next/server"
import { parse } from "csv-parse/sync"
import { getCurrentUser } from "@/lib/auth"

// Helper function to sanitize column names
const sanitizeColumnName = (name: string) => {
  if (!name) return "column_" + Math.random().toString(36).substring(2, 7)
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .substring(0, 63)
}

// Helper function to determine PostgreSQL data type
const determineDataType = (value: any) => {
  if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) return "TEXT"

  // Check if it's a boolean
  if (typeof value === "boolean" || value === "true" || value === "false") return "BOOLEAN"

  // Check if it's a number
  if (typeof value === "number" || (!isNaN(Number(value)) && value !== "")) {
    // Check if it's an integer
    if (Number.isInteger(Number(value))) return "INTEGER"
    return "NUMERIC"
  }

  // Check if it's a date
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD
  if (typeof value === "string" && dateRegex.test(value)) return "DATE"

  // Check if it's a timestamp
  const timestampRegex = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/
  if (typeof value === "string" && timestampRegex.test(value)) return "TIMESTAMP"

  // Default to text
  return "TEXT"
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Read file content
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const csvContent = fileBuffer.toString()

    // Parse CSV
    const parseOptions = {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      skip_records_with_error: true,
      relax_column_count: true,
    }

    try {
      const records = parse(csvContent, parseOptions)

      if (records.length === 0) {
        return NextResponse.json({ error: "CSV file is empty or has no valid records" }, { status: 400 })
      }

      // Analyze the first few records to determine column types
      const sampleSize = Math.min(records.length, 10)
      const sampleRecords = records.slice(0, sampleSize)

      // Get all unique column names from the sample
      const allColumns = new Set<string>()
      sampleRecords.forEach((record) => {
        Object.keys(record).forEach((key) => allColumns.add(key))
      })

      // Analyze each column
      const columnAnalysis = Array.from(allColumns).map((columnName) => {
        const sanitizedName = sanitizeColumnName(columnName)
        const values = sampleRecords.map((record) => record[columnName]).filter((value) => value !== undefined)

        // Count non-null values
        const nonNullCount = values.filter((value) => value !== null && value !== undefined && value !== "").length

        // Determine data type
        let dataType = "TEXT"
        if (nonNullCount > 0) {
          // Get the first non-null value
          const firstNonNull = values.find((value) => value !== null && value !== undefined && value !== "")

          if (firstNonNull !== undefined) {
            dataType = determineDataType(firstNonNull)
          }
        }

        // Check if all values conform to this type
        let consistent = true
        for (const value of values) {
          if (value === null || value === undefined || value === "") continue

          const valueType = determineDataType(value)
          if (valueType !== dataType) {
            consistent = false
            break
          }
        }

        return {
          originalName: columnName,
          sanitizedName,
          dataType,
          typeConsistent: consistent,
          nullableCount: sampleSize - nonNullCount,
          nullable: nonNullCount < sampleSize,
          sampleValues: values.slice(0, 3),
        }
      })

      // Generate CREATE TABLE SQL
      const createTableSQL = `CREATE TABLE "table_name" (\n  ${columnAnalysis
        .map((col) => `"${col.sanitizedName}" ${col.dataType}`)
        .join(",\n  ")}\n)`

      return NextResponse.json({
        success: true,
        fileName: file.name,
        fileSize: file.size,
        recordCount: records.length,
        sampleSize,
        columns: columnAnalysis,
        createTableSQL,
        sampleRecords,
      })
    } catch (error) {
      console.error("Error analyzing CSV:", error)
      return NextResponse.json(
        {
          error: "Failed to analyze CSV file",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Error in CSV analyzer:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

