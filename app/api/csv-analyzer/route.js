import { NextResponse } from "next/server"
import { parse } from "csv-parse/sync"

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Read file content
    const buffer = Buffer.from(await file.arrayBuffer())
    const content = buffer.toString()

    // Parse CSV
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    if (records.length === 0) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 })
    }

    // Analyze column types
    const columns = Object.keys(records[0])
    const columnTypes = {}
    const sampleValues = {}

    columns.forEach((column) => {
      columnTypes[column] = inferColumnType(records, column)
      sampleValues[column] = records.slice(0, 5).map((record) => record[column])
    })

    // Count rows
    const rowCount = records.length

    return NextResponse.json({
      columns,
      columnTypes,
      sampleValues,
      rowCount,
    })
  } catch (error) {
    console.error("Error analyzing CSV:", error)
    return NextResponse.json({ error: "Failed to analyze CSV file" }, { status: 500 })
  }
}

function inferColumnType(records, column) {
  // Sample up to 100 non-empty values
  const samples = records
    .slice(0, 100)
    .map((record) => record[column])
    .filter((value) => value !== null && value !== undefined && value !== "")

  if (samples.length === 0) return "text"

  // Check if all values are numbers
  const allNumbers = samples.every((value) => !isNaN(Number(value)))
  if (allNumbers) {
    // Check if all values are integers
    const allIntegers = samples.every((value) => Number.isInteger(Number(value)))
    return allIntegers ? "integer" : "numeric"
  }

  // Check if all values are dates
  const datePattern = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$|^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/
  const allDates = samples.every((value) => datePattern.test(value))
  if (allDates) return "date"

  // Check if all values are booleans
  const booleanValues = ["true", "false", "yes", "no", "y", "n", "1", "0"]
  const allBooleans = samples.every((value) => booleanValues.includes(value.toLowerCase()))
  if (allBooleans) return "boolean"

  // Default to text
  return "text"
}
