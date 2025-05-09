import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { name: string } }) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tableName = params.name

    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = ${tableName}
      ) as exists;
    `

    if (!tableExists[0]?.exists) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    // Get table columns
    const columns = await sql`
      SELECT 
        column_name as name, 
        data_type as type,
        is_nullable as nullable,
        column_default as default_value
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = ${tableName}
      ORDER BY ordinal_position
    `

    // Get primary key information
    const primaryKeys = await sql`
      SELECT a.attname as column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = ${tableName}::regclass
      AND i.indisprimary
    `

    // Get foreign key information
    const foreignKeys = await sql`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = ${tableName}
    `

    // Get table row count (approximate)
    const rowCount = await sql`
      SELECT reltuples::bigint AS approximate_row_count
      FROM pg_class
      WHERE relname = ${tableName}
    `

    // Get table size
    const tableSize = await sql`
      SELECT pg_size_pretty(pg_total_relation_size(${tableName}::regclass)) as size
    `

    // Enhance columns with primary and foreign key information
    const enhancedColumns = columns.map((column) => {
      const isPrimaryKey = primaryKeys.some((pk) => pk.column_name === column.name)
      const foreignKey = foreignKeys.find((fk) => fk.column_name === column.name)

      return {
        ...column,
        isPrimaryKey,
        foreignKey: foreignKey
          ? {
              table: foreignKey.foreign_table_name,
              column: foreignKey.foreign_column_name,
            }
          : null,
      }
    })

    return NextResponse.json({
      name: tableName,
      columns: enhancedColumns,
      rowCount: rowCount[0]?.approximate_row_count || 0,
      size: tableSize[0]?.size || "0 bytes",
    })
  } catch (error) {
    console.error(`Error fetching table ${params.name} details:`, error)
    return NextResponse.json(
      {
        error: `Failed to fetch table details: ${error.message}`,
      },
      { status: 500 },
    )
  }
}

