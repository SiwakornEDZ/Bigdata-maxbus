export async function GET() {
  try {
    // ตรวจสอบว่ามี environment variables ที่จำเป็นหรือไม่
    const envVars = {
      DATABASE_URL: process.env && process.env.DATABASE_URL ? "set" : "not set",
      JWT_SECRET: process.env && process.env.JWT_SECRET ? "set" : "not set",
      NODE_ENV: process.env && process.env.NODE_ENV ? process.env.NODE_ENV : "development",
    }

    let databaseConnected = false
    let databaseError = null
    let databaseTables = []

    // ทดสอบการเชื่อมต่อฐานข้อมูลเฉพาะเมื่อมี DATABASE_URL
    if (envVars.DATABASE_URL === "set") {
      try {
        // Import เฉพาะเมื่อต้องการใช้งาน
        const { testConnection, getAllTables } = await import("@/lib/db")

        if (typeof testConnection !== "function") {
          throw new Error("testConnection is not a function")
        }

        const connectionTest = await testConnection()
        databaseConnected = connectionTest.connected
        databaseError = connectionTest.error

        if (databaseConnected && typeof getAllTables === "function") {
          try {
            databaseTables = await getAllTables()
          } catch (tablesError) {
            console.error("Error getting tables:", tablesError)
            databaseTables = []
          }
        }
      } catch (dbError) {
        console.error("Database test error:", dbError)
        databaseError = dbError.message || "Database connection failed"
        databaseConnected = false
      }
    } else {
      databaseError = "DATABASE_URL environment variable is not set"
    }

    return new Response(
      JSON.stringify({
        success: true,
        envVars,
        databaseConnected,
        databaseError,
        databaseTables: databaseTables || [],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Error checking environment:", error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error checking environment",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
