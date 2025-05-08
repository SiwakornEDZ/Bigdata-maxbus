import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    // Create a default admin user if it doesn't exist
    const existingAdmin = await sql`SELECT * FROM users WHERE email = ${"admin@example.com"}`

    if (existingAdmin.length === 0) {
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash("admin123", salt)

      await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (${"Admin User"}, ${"admin@example.com"}, ${passwordHash}, ${"admin"})
      `
    }

    // Create a default regular user if it doesn't exist
    const existingUser = await sql`SELECT * FROM users WHERE email = ${"user@example.com"}`

    if (existingUser.length === 0) {
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash("user123", salt)

      await sql`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (${"Regular User"}, ${"user@example.com"}, ${passwordHash}, ${"user"})
      `
    }

    // Seed data sources if empty
    const dataSources = await sql`SELECT COUNT(*) as count FROM data_sources`

    if (dataSources[0].count === 0) {
      await sql`
        INSERT INTO data_sources (name, type, connection_details)
        VALUES 
          (${"MySQL Production DB"}, ${"mysql"}, ${{ host: "prod-mysql.example.com", port: 3306, database: "production" }}),
          (${"PostgreSQL Analytics"}, ${"postgres"}, ${{ host: "analytics-db.example.com", port: 5432, database: "analytics" }}),
          (${"MongoDB Document Store"}, ${"mongodb"}, ${{ uri: "mongodb://mongo.example.com:27017/documents" }}),
          (${"Kafka Stream"}, ${"kafka"}, ${{ bootstrap_servers: "kafka.example.com:9092" }})
      `
    }

    // Seed import jobs if empty
    const importJobs = await sql`SELECT COUNT(*) as count FROM import_jobs`

    if (importJobs[0].count === 0) {
      await sql`
        INSERT INTO import_jobs (name, source_type, destination, status, file_name, file_size, file_type, records_count, created_at, completed_at)
        VALUES 
          (${"Customer Data Import"}, ${"file"}, ${"data-warehouse"}, ${"completed"}, ${"customers.csv"}, ${2560000}, ${"csv"}, ${50000}, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day 23 hours'}),
          (${"Products Import"}, ${"file"}, ${"data-lake"}, ${"completed"}, ${"products.json"}, ${1280000}, ${"json"}, ${12500}, CURRENT_TIMESTAMP - INTERVAL '1 day'}, CURRENT_TIMESTAMP - INTERVAL '23 hours'),
          (${"Sales Transactions"}, ${"file"}, ${"analytics"}, ${"processing"}, ${"transactions.csv"}, ${5120000}, ${"csv"}, ${0}, CURRENT_TIMESTAMP - INTERVAL '1 hour'}, NULL),
          (${"User Events"}, ${"api"}, ${"data-lake"}, ${"failed"}, NULL, NULL, NULL, ${0}, CURRENT_TIMESTAMP - INTERVAL '5 hours'}, CURRENT_TIMESTAMP - INTERVAL '4 hours 50 minutes'})
      `
    }

    // Seed system logs if empty
    const systemLogs = await sql`SELECT COUNT(*) as count FROM system_logs`

    if (systemLogs[0].count === 0) {
      await sql`
        INSERT INTO system_logs (log_id, service, level, message, details, timestamp)
        VALUES 
          (${"SYS-1001"}, ${"System Startup"}, ${"info"}, ${"System initialized successfully"}, ${null}, CURRENT_TIMESTAMP - INTERVAL '3 days'}),
          (${"DB-2001"}, ${"Database"}, ${"info"}, ${"Database connection established"}, ${null}, CURRENT_TIMESTAMP - INTERVAL '3 days'}),
          (${"AUTH-3001"}, ${"Authentication"}, ${"info"}, ${"User logged in: admin@example.com"}, ${{ ip: "192.168.1.100" }}, CURRENT_TIMESTAMP - INTERVAL '2 days'}),
          (${"IMP-4001"}, ${"Data Import"}, ${"info"}, ${"Import job started: Customer Data Import"}, ${{ id: 1 }}, CURRENT_TIMESTAMP - INTERVAL '2 days'}),
          (${"IMP-4002"}, ${"Data Import"}, ${"info"}, ${"Import job completed: Customer Data Import"}, ${{ id: 1, records: 50000 }}, CURRENT_TIMESTAMP - INTERVAL '1 day 23 hours'}),
          (${"IMP-4003"}, ${"Data Import"}, ${"error"}, ${"Import job failed: User Events"}, ${{ id: 4, error: "API connection timeout" }}, CURRENT_TIMESTAMP - INTERVAL '4 hours 50 minutes'}),
          (${"AUTH-3002"}, ${"Authentication"}, ${"warning"}, ${"Failed login attempt: unknown@example.com"}, ${{ ip: "203.0.113.45" }}, CURRENT_TIMESTAMP - INTERVAL '1 day'}),
          (${"SYS-1002"}, ${"System Monitor"}, ${"warning"}, ${"High CPU usage detected"}, ${{ usage: 87 }}, CURRENT_TIMESTAMP - INTERVAL '12 hours'}),
          (${"NET-5001"}, ${"Network"}, ${"error"}, ${"Connection failed to remote service"}, ${{ service: "external-api.example.com" }}, CURRENT_TIMESTAMP - INTERVAL '6 hours'}),
          (${"DB-2002"}, ${"Database"}, ${"info"}, ${"Database backup completed"}, ${{ size: "2.3GB" }}, CURRENT_TIMESTAMP - INTERVAL '3 hours'})
      `
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (error) {
    console.error("Database seeding error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to seed database", error: String(error) },
      { status: 500 },
    )
  }
}
