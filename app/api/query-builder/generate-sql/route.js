import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { tables, columns, filters, joins, groupBy, orderBy, limit } = await request.json()

    if (!tables || tables.length === 0 || !columns || columns.length === 0) {
      return NextResponse.json({ error: "Tables and columns are required" }, { status: 400 })
    }

    // Build SELECT clause
    const selectClause = columns
      .map((col) => {
        if (col.aggregate) {
          return `${col.aggregate}(${col.table}.${col.column}) AS "${col.alias || `${col.aggregate}_${col.column}`}"`
        }
        return `${col.table}.${col.column}${col.alias ? ` AS "${col.alias}"` : ""}`
      })
      .join(", ")

    // Build FROM clause
    const fromClause = `${tables[0]}`

    // Build JOIN clause
    const joinClause = joins
      ? joins
          .map(
            (join) =>
              `${join.type || "INNER"} JOIN ${join.table} ON ${join.leftTable}.${join.leftColumn} = ${join.table}.${
                join.rightColumn
              }`,
          )
          .join(" ")
      : ""

    // Build WHERE clause
    const whereClause = filters
      ? filters
          .map((filter) => {
            const value =
              filter.dataType === "number"
                ? filter.value
                : filter.dataType === "boolean"
                  ? filter.value
                  : `'${filter.value}'`
            return `${filter.table}.${filter.column} ${filter.operator} ${value}`
          })
          .join(" AND ")
      : ""

    // Build GROUP BY clause
    const groupByClause = groupBy ? groupBy.map((g) => `${g.table}.${g.column}`).join(", ") : ""

    // Build ORDER BY clause
    const orderByClause = orderBy ? orderBy.map((o) => `${o.table}.${o.column} ${o.direction}`).join(", ") : ""

    // Build LIMIT clause
    const limitClause = limit ? `${limit}` : ""

    // Assemble the query
    let query = `SELECT ${selectClause} FROM ${fromClause}`
    if (joinClause) query += ` ${joinClause}`
    if (whereClause) query += ` WHERE ${whereClause}`
    if (groupByClause) query += ` GROUP BY ${groupByClause}`
    if (orderByClause) query += ` ORDER BY ${orderByClause}`
    if (limitClause) query += ` LIMIT ${limitClause}`

    return NextResponse.json({ query })
  } catch (error) {
    console.error("Error generating SQL:", error)
    return NextResponse.json({ error: "Failed to generate SQL" }, { status: 500 })
  }
}
