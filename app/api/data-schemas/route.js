import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Get all tables
    const tables = await sql`
      SELECT 
        table_name 
      FROM 
        information_schema.tables 
      WHERE 
        table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY 
        table_name
    `

    // For each table, get its columns
    const schemas = await Promise.all(
      tables.map(async (table) => {
        const columns = await sql`
          SELECT 
            column_name, 
            data_type, 
            is_nullable,
            column_default
          FROM 
            information_schema.columns 
          WHERE 
            table_schema = 'public' 
            AND table_name = ${table.table_name}
          ORDER BY 
            ordinal_position
        `

        // Get primary key
        const primaryKey = await sql`
          SELECT 
            kcu.column_name
          FROM 
            information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
          WHERE 
            tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name = ${table.table_name}
        `

        // Get foreign keys
        const foreignKeys = await sql`
          SELECT 
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM 
            information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
          WHERE 
            tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND tc.table_name = ${table.table_name}
        `

        return {
          name: table.table_name,
          columns: columns.map((col) => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === "YES",
            default: col.column_default,
            isPrimaryKey: primaryKey.some((pk) => pk.column_name === col.column_name),
            foreignKey: foreignKeys.find((fk) => fk.column_name === col.column_name)
              ? {
                  table: foreignKeys.find((fk) => fk.column_name === col.column_name).foreign_table_name,
                  column: foreignKeys.find((fk) => fk.column_name === col.column_name).foreign_column_name,
                }
              : null,
          })),
        }
      }),
    )

    return NextResponse.json(schemas)
  } catch (error) {
    console.error("Error fetching data schemas:", error)
    return NextResponse.json({ error: "Failed to fetch data schemas" }, { status: 500 })
  }
}
