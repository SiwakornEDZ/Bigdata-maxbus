import { NextResponse } from "next/server"
import { sql, tableExists } from "@/lib/db"

export async function POST() {
  try {
    // Test database connection first
    try {
      await sql`SELECT 1`
    } catch (connectionError) {
      console.error("Database connection error:", connectionError)
      return NextResponse.json(
        {
          success: false,
          message: `Database connection failed: ${connectionError.message}`,
        },
        { status: 500 },
      )
    }

    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create import_jobs table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS import_jobs (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        records_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id),
        file_size INTEGER DEFAULT 0,
        file_type VARCHAR(50),
        error_message TEXT
      );
    `

    // Create saved_queries table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS saved_queries (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        query TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        is_public BOOLEAN DEFAULT false
      );
    `

    // Create query_history table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS query_history (
        id SERIAL PRIMARY KEY,
        query TEXT NOT NULL,
        user_id INTEGER REFERENCES users(id),
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time INTEGER,
        row_count INTEGER,
        status VARCHAR(50)
      );
    `

    // Insert a default admin user if no users exist
    const userCount = await sql`SELECT COUNT(*) FROM users`
    if (Number.parseInt(userCount[0].count) === 0) {
      // Default password is 'admin123' - should be changed immediately in production
      await sql`
        INSERT INTO users (username, email, password, role)
        VALUES ('admin', 'admin@example.com', '$2a$10$eCQYn5SPUkOA2Dw9XCp8o.3hB5Wp2jQjE0qRmVrYgXWMnvZ9U6rIe', 'admin');
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Database initialization failed: ${error.message}`,
      },
      { status: 500 },
    )
  }
}

// Add a GET method to check if the database is initialized
export async function GET() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ initialized: false, error: "DATABASE_URL not set" }, { status: 200 })
    }

    // Check database connection
    try {
      await sql`SELECT 1`
    } catch (error: any) {
      return NextResponse.json(
        {
          initialized: false,
          error: `Database connection failed: ${error.message}`,
        },
        { status: 200 },
      )
    }

    // Check if users table exists
    const usersTableExists = await tableExists("users")

    return NextResponse.json(
      {
        initialized: usersTableExists,
        message: usersTableExists ? "Database is initialized" : "Database needs initialization",
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Error checking database initialization:", error)
    return NextResponse.json(
      {
        initialized: false,
        error: `Error checking database: ${error.message}`,
      },
      { status: 200 },
    )
  }
}

