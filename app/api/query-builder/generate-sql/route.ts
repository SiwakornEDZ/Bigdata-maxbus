import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Extract query components
    const { tables, columns, joins, filters, groupBy, orderBy, limit, aggregations, distinct } = body

    if (!tables || tables.length === 0) {
      return NextResponse.json({ error: "At least one table is required" }, { status: 400 })
    }

    // Build the SQL query
    let sql = "SELECT "

    // Add DISTINCT if requested
    if (distinct) {
      sql += "DISTINCT "
    }

    // Add columns
    if (columns && columns.length > 0) {
      const columnsList = columns.map((col) => {
        if (typeof col === "string") {
          return col
        }
        const { table, column, alias } = col
        return `"${table}"."${column}"${alias ? ` AS "${alias}"` : ""}`
      })
      sql += columnsList.join(", ")
    } else {
      sql += "*"
    }

    // Add FROM clause
    sql += `\nFROM "${tables[0]}"`

    // Add JOINs
    if (joins && joins.length > 0) {
      joins.forEach((join) => {
        sql += `\n${join.type} "${join.rightTable}" ON "${join.leftTable}"."${join.leftColumn}" = "${join.rightTable}"."${join.rightColumn}"`
      })
    }

    // Add WHERE clause
    if (filters && filters.length > 0) {
      sql += "\nWHERE "
      const filterClauses = filters.map((filter) => {
        const { table, column, operator, value } = filter

        // Handle special operators
        if (operator === "IS NULL") {
          return `"${table}"."${column}" IS NULL`
        } else if (operator === "IS NOT NULL") {
          return `"${table}"."${column}" IS NOT NULL`
        } else if (operator === "IN" || operator === "NOT IN") {
          // Handle array values
          const values = Array.isArray(value)
            ? value.map((v) => `'${v}'`).join(", ")
            : value
                .split(",")
                .map((v) => `'${v.trim()}'`)
                .join(", ")
          return `"${table}"."${column}" ${operator} (${values})`
        } else if (operator === "BETWEEN") {
          const [min, max] = value.split(",").map((v) => v.trim())
          return `"${table}"."${column}" BETWEEN ${min} AND ${max}`
        } else if (operator === "LIKE" || operator === "NOT LIKE") {
          return `"${table}"."${column}" ${operator} '%${value}%'`
        } else {
          // For standard operators
          return `"${table}"."${column}" ${operator} '${value}'`
        }
      })
      sql += filterClauses.join(" AND ")
    }

    // Add GROUP BY clause
    if (groupBy && groupBy.length > 0) {
      sql += "\nGROUP BY "
      const groupClauses = groupBy.map((group) => {
        const [table, column] = group.split(".")
        return `"${table}"."${column}"`
      })
      sql += groupClauses.join(", ")
    }

    // Add ORDER BY clause
    if (orderBy && orderBy.length > 0) {
      sql += "\nORDER BY "
      const orderClauses = orderBy.map((order) => {
        const { column, direction } = order
        const [table, col] = column.split(".")
        return `"${table}"."${col}" ${direction.toUpperCase()}`
      })
      sql += orderClauses.join(", ")
    }

    // Add LIMIT clause
    if (limit && limit > 0) {
      sql += `\nLIMIT ${limit}`
    }

    // Add semicolon
    sql += ";"

    return NextResponse.json({
      success: true,
      sql,
    })
  } catch (error) {
    console.error("Error generating SQL query:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate SQL query",
      },
      { status: 500 },
    )
  }
}
