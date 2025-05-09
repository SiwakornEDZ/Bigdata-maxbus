import { neon, type NeonConfig } from "@neondatabase/serverless"
import { Pool } from "pg"

// Extend NeonConfig type to include ssl option
interface CustomNeonConfig extends NeonConfig {
  ssl: boolean | { rejectUnauthorized: boolean }
}

let sql

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not defined. Database functionality will be limited.")
  sql = () => {
    throw new Error("DATABASE_URL is not defined")
  }
} else {
  try {
    const config: CustomNeonConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }

    sql = neon(config.connectionString)
    console.log("Neon database connection initialized")
  } catch (error) {
    console.error("Failed to initialize Neon database connection:", error)
    process.exit(1)
  }
}

async function withTransaction(callback) {
  const client = new Pool({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
    await client.end()
  }
}

export { sql, withTransaction }
