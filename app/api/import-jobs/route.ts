import { NextResponse } from "next/server"
import { sql, tableExists } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { parse } from "csv-parse/sync"
import { v4 as uuidv4 } from "uuid"

// Helper function to generate a unique table name
const generateTableName = (baseName: string) => {
  const timestamp = new Date().getTime()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const sanitizedBaseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .substring(0, 50) // Limit length
  return `${sanitizedBaseName}_${timestamp}_${randomStr}`.substring(0, 63) // Ensure total length is under limit
}

// Helper function to log system events
async function logSystemEvent(service: string, level: string, message: string, details: any, createdBy: string) {
  try {
    await sql`
      INSERT INTO system_logs (
        service, 
        level, 
        message, 
        details,
        created_by,
        log_id
      )
      VALUES (
        ${service},
        ${level},
        ${message},
        ${JSON.stringify(details)},
        ${createdBy},
        ${uuidv4()}
      )
    `
    return true
  } catch (error) {
    console.error("Error logging system event:", error)
    return false
  }
}

// Helper function to verify table exists and has data
async function verifyTable(tableName: string) {
  try {
    // Check if table exists
    const exists = await tableExists(tableName)
    if (!exists) {
      return { exists: false, message: "Table does not exist in database" }
    }

    // Check if table has data
    const countResult = await sql.unsafe(`SELECT COUNT(*) FROM "${tableName}"`)
    const count = Number.parseInt(countResult[0]?.count || "0")

    return {
      exists: true,
      hasData: count > 0,
      count,
      message: count > 0 ? `Table exists with ${count} rows` : "Table exists but has no data",
    }
  } catch (error) {
    console.error(`Error verifying table ${tableName}:`, error)
    return {
      exists: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Error verifying table",
    }
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get status filter from query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const verifyTables = searchParams.get("verify") === "true"

    // Build the query based on filters
    let query = sql`
      SELECT * FROM import_jobs
      WHERE created_by = ${user.email}
    `

    // Add status filter if provided
    if (status) {
      query = sql`
        ${query} AND status = ${status}
      `
    }

    // Add order by
    query = sql`
      ${query} ORDER BY created_at DESC
    `

    const importJobs = await query

    // If verify flag is set, check each table
    if (verifyTables) {
      const verifiedJobs = []

      for (const job of importJobs) {
        if (job.table_name) {
          const verification = await verifyTable(job.table_name)
          verifiedJobs.push({
            ...job,
            table_verification: verification,
          })
        } else {
          verifiedJobs.push({
            ...job,
            table_verification: { exists: false, message: "No table name specified" },
          })
        }
      }

      return NextResponse.json(verifiedJobs)
    }

    return NextResponse.json(importJobs)
  } catch (error) {
    console.error("Error fetching import jobs:", error)
    return NextResponse.json({ error: "Failed to fetch import jobs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  let importId // Declare importId here
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check database connection
    try {
      await sql`SELECT 1` // A simple test query
    } catch (connectionError: any) {
      console.error("Database connection error:", connectionError)
      return NextResponse.json(
        {
          success: false,
          error: `Database connection failed: ${connectionError.message}`,
        },
        { status: 500 },
      )
    }

    // Parse form data
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const sourceType = formData.get("sourceType") as string
    const file = formData.get("file") as File
    const autoClean = formData.get("autoClean") !== "false" // Default to true

    if (!name || !sourceType || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate a table name based on the import name
    const baseTableName = name.toLowerCase().replace(/[^a-z0-9_]/g, "_")
    const tableName = generateTableName(baseTableName)

    // Add logging for debugging
    console.log("Creating import job with name:", name, "sourceType:", sourceType, "tableName:", tableName)

    // Create import job record with processing status
    const importJob = await sql`
      INSERT INTO import_jobs (
        name, 
        source_type, 
        destination, 
        status, 
        file_name, 
        file_size, 
        file_type,
        created_by,
        table_name
      )
      VALUES (
        ${name}, 
        ${sourceType}, 
        ${"database"}, 
        ${"pending"}, 
        ${file.name}, 
        ${file.size}, 
        ${file.type},
        ${user.email},
        ${tableName}
      )
      RETURNING *
    `

    if (!importJob || importJob.length === 0) {
      throw new Error("Failed to create import job record")
    }

    importId = importJob[0].id

    // Process the file based on its type
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // For CSV files, create a table and import the data
    if (sourceType === "csv") {
      try {
        // Parse CSV with more flexible options
        const csvContent = fileBuffer.toString()
        let records = []
        let parseError = null
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
          records = parse(csvContent, parseOptions)
        } catch (error) {
          console.error("Error with default parsing, trying alternative options:", error)
          parseError = error

          // Try alternative parsing options
          try {
            // Try with different delimiter
            parseOptions = { ...parseOptions, delimiter: ";" }
            records = parse(csvContent, parseOptions)
            parseError = null
          } catch (error2) {
            try {
              // Try with different quote character
              parseOptions = { ...parseOptions, delimiter: ",", quote: "'" }
              records = parse(csvContent, parseOptions)
              parseError = null
            } catch (error3) {
              // Try without headers
              try {
                parseOptions = {
                  columns: false,
                  skip_empty_lines: true,
                  trim: true,
                  skip_records_with_error: true,
                  relax_column_count: true,
                  relax_quotes: true,
                }
                const rawRecords = parse(csvContent, parseOptions)

                if (rawRecords.length > 0) {
                  // Use first row as headers
                  const headers = rawRecords[0]
                  records = rawRecords.slice(1).map((row) => {
                    const record = {}
                    headers.forEach((header, index) => {
                      record[header || `column_${index}`] = row[index] || null
                    })
                    return record
                  })
                  parseError = null
                }
              } catch (error4) {
                // If all parsing attempts fail, throw the original error
                throw parseError
              }
            }
          }
        }

        if (records.length === 0) {
          throw new Error("CSV file is empty or invalid")
        }

        console.log(`Successfully parsed ${records.length} records from CSV`)

        // Create table with a single JSONB column
        const createTableSQL = `CREATE TABLE "${tableName}" (
          id SERIAL PRIMARY KEY,
          data JSONB
        )`

        try {
          console.log(`Executing CREATE TABLE: ${createTableSQL}`)
          await sql.unsafe(createTableSQL)
          console.log(`Table ${tableName} created successfully`)

          // Log the schema for debugging
          await logSystemEvent(
            "Data Import",
            "info",
            `Created table ${tableName}`,
            {
              importId,
              tableName,
              sql: createTableSQL,
            },
            user.email,
          )
        } catch (createError: any) {
          console.error("Error creating table:", createError)
          console.error("SQL query that caused the error:", createTableSQL)

          // Log the specific error details
          await logSystemEvent(
            "Data Import",
            "error",
            `Failed to create table ${tableName}`,
            {
              importId,
              tableName,
              sql: createTableSQL,
              error: createError.message, // Include the error message
              stack: createError.stack, // Include the stack trace
            },
            user.email,
          )

          // Update import job status to failed
          const errorMessage = createError instanceof Error ? createError.message : "Unknown error"
          await sql`
            UPDATE import_jobs
            SET status = ${"failed"},
                error_message = ${errorMessage},
                completed_at = NOW()
            WHERE id = ${importId}
          `

          return NextResponse.json(
            {
              success: false,
              error: `Failed to create table: ${createError instanceof Error ? createError.message : "Unknown error"}`,
              tableName,
            },
            { status: 500 },
          )
        }

        // Verify table was created
        const tableCheck = await tableExists(tableName)
        if (!tableCheck) {
          throw new Error(`Failed to create table ${tableName}`)
        }

        // Insert data in batches - one record at a time for better error handling
        let totalInserted = 0
        const failedRecords = []

        for (let i = 0; i < records.length; i++) {
          const record = records[i]
          try {
            const insertSQL = `INSERT INTO "${tableName}" (data) VALUES ($1)`
            console.log(`Executing INSERT: ${insertSQL}`)
            await sql.unsafe(insertSQL, JSON.stringify(record))
            totalInserted++
          } catch (singleInsertError) {
            console.error(`Error inserting record ${i}:`, singleInsertError)
            failedRecords.push({
              record,
              error: singleInsertError instanceof Error ? singleInsertError.message : "Unknown error",
            })
          }
        }

        // Simulate Spark processing
        await sql`
          UPDATE import_jobs
          SET status = ${"processing"},
              updated_at = NOW()
          WHERE id = ${importId}
        `

        // Simulate data transformation and aggregation
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate 2 seconds of processing

        // Simulate a simple data cleaning step
        const cleanedRecords = records.map((record) => {
          const cleanedRecord: any = {}
          for (const key in record) {
            if (record.hasOwnProperty(key)) {
              cleanedRecord[key] = typeof record[key] === "string" ? record[key].trim() : record[key]
            }
          }
          return cleanedRecord
        })

        // Simulate aggregation (e.g., counting rows)
        const aggregationResult = {
          rowCount: records.length,
        }

        // Update import job status
        const statusMessage = failedRecords.length > 0 ? `${failedRecords.length} records failed to import` : null
        await sql`
          UPDATE import_jobs
          SET status = ${failedRecords.length > 0 ? "completed_with_errors" : "completed"},
              completed_at = NOW(),
              records_count = ${totalInserted},
              error_message = ${statusMessage}
          WHERE id = ${importId}
        `

        return NextResponse.json({
          success: true,
          id: importId,
          tableName,
          recordsCount: totalInserted,
          failedRecords: failedRecords.length,
          cleaningStats: {
            totalRecords: records.length,
            nullValues: 0, // Replace with actual null value count
            modifiedValues: 0, // Replace with actual modified value count
          },
          aggregationResult,
        })
      } catch (error) {
        console.error("Error processing CSV file:", error)

        // Update import job status to failed
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        await sql`
          UPDATE import_jobs
          SET status = ${"failed"},
              error_message = ${errorMessage},
              completed_at = NOW()
          WHERE id = ${importId}
        `

        // Log error using the helper function
        await logSystemEvent(
          "Data Import",
          "error",
          "Import failed",
          {
            importId,
            tableName,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          user.email,
        )

        throw error
      }
    } else if (sourceType === "json") {
      // Similar implementation for JSON files with data cleaning
      try {
        // Parse JSON
        const jsonContent = fileBuffer.toString()
        let records = []

        try {
          const parsedData = JSON.parse(jsonContent)

          // Handle different JSON structures
          if (Array.isArray(parsedData)) {
            // Direct array of records
            records = parsedData
          } else if (typeof parsedData === "object" && parsedData !== null) {
            // Check if it's an object with a data/items/records property
            const possibleArrayProps = ["data", "items", "records", "results", "rows"]
            for (const prop of possibleArrayProps) {
              if (Array.isArray(parsedData[prop])) {
                records = parsedData[prop]
                break
              }
            }

            // If we still don't have records, treat the object as a single record
            if (records.length === 0 && Object.keys(parsedData).length > 0) {
              records = [parsedData]
            }
          }

          if (records.length === 0) {
            throw new Error("JSON file contains no valid records")
          }
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError)
          throw new Error(`Failed to parse JSON: ${parseError.message}`)
        }

        console.log(`Successfully parsed ${records.length} records from JSON`)

        // Create table with a single JSONB column
        const createTableSQL = `CREATE TABLE "${tableName}" (
          id SERIAL PRIMARY KEY,
          data JSONB
        )`

        try {
          console.log(`Executing CREATE TABLE: ${createTableSQL}`)
          await sql.unsafe(createTableSQL)
          console.log(`Table ${tableName} created successfully`)
        } catch (createError) {
          console.error(`Error creating table ${tableName}:`, createError)

          // Log the specific error details
          await logSystemEvent(
            "Data Import",
            "error",
            `Failed to create table ${tableName}`,
            {
              importId,
              tableName,
              sql: createTableSQL,
              error: createError.message, // Include the error message
              stack: createError.stack, // Include the stack trace
            },
            user.email,
          )

          // Update import job status to failed
          const errorMessage = createError instanceof Error ? createError.message : "Unknown error"
          await sql`
            UPDATE import_jobs
            SET status = ${"failed"},
                error_message = ${errorMessage},
                completed_at = NOW()
            WHERE id = ${importId}
          `

          return NextResponse.json(
            {
              success: false,
              error: `Failed to create table: ${createError instanceof Error ? createError.message : "Unknown error"}`,
              tableName,
            },
            { status: 500 },
          )
        }

        // Insert data in batches - one record at a time for better error handling
        let totalInserted = 0
        const failedRecords = []

        for (let i = 0; i < records.length; i++) {
          const record = records[i]
          try {
            const insertSQL = `INSERT INTO "${tableName}" (data) VALUES ($1)`
            console.log(`Executing INSERT: ${insertSQL}`)
            await sql.unsafe(insertSQL, JSON.stringify(record))
            totalInserted++
          } catch (singleInsertError) {
            console.error(`Error inserting record ${i}:`, singleInsertError)
            failedRecords.push({
              record,
              error: singleInsertError instanceof Error ? singleInsertError.message : "Unknown error",
            })
          }
        }

        // Simulate Spark processing
        await sql`
          UPDATE import_jobs
          SET status = ${"processing"},
              updated_at = NOW()
          WHERE id = ${importId}
        `

        // Simulate data transformation and aggregation
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate 2 seconds of processing

        // Simulate a simple data cleaning step
        const cleanedRecords = records.map((record) => {
          const cleanedRecord: any = {}
          for (const key in record) {
            if (record.hasOwnProperty(key)) {
              cleanedRecord[key] = typeof record[key] === "string" ? record[key].trim() : record[key]
            }
          }
          return cleanedRecord
        })

        // Simulate aggregation (e.g., counting rows)
        const aggregationResult = {
          rowCount: records.length,
        }

        // Update import job status
        const statusMessage = failedRecords.length > 0 ? `${failedRecords.length} records failed to import` : null
        await sql`
          UPDATE import_jobs
          SET status = ${failedRecords.length > 0 ? "completed_with_errors" : "completed"},
              completed_at = NOW(),
              records_count = ${totalInserted},
              error_message = ${statusMessage}
          WHERE id = ${importId}
        `

        return NextResponse.json({
          success: true,
          id: importId,
          tableName,
          recordsCount: totalInserted,
          failedRecords: failedRecords.length,
          cleaningStats: {
            totalRecords: records.length,
            nullValues: 0, // Replace with actual null value count
            modifiedValues: 0, // Replace with actual modified value count
          },
          aggregationResult,
        })
      } catch (error) {
        console.error("Error processing JSON file:", error)

        // Update import job status to failed
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        await sql`
          UPDATE import_jobs
          SET status = ${"failed"},
              error_message = ${errorMessage},
              completed_at = NOW()
          WHERE id = ${importId}
        `

        throw error
      }
    }

    return NextResponse.json({
      success: true,
      id: importId,
      tableName,
    })
  } catch (error) {
    console.error("Error in import job creation:", error)

    // Update import job status to failed
    const errorMessage = error instanceof Error ? error.message : "Failed to create import job"
    await sql`
      UPDATE import_jobs
      SET status = ${"failed"},
          error_message = ${errorMessage},
          completed_at = NOW()
      WHERE id = ${importId}
    `

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
