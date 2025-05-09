"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Database } from "lucide-react"

export function DatabaseInitializer() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")
  const [showInitializer, setShowInitializer] = useState(false)

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch("/api/check-env")

      if (!response.ok) {
        return
      }

      const data = await response.json()

      if (!data || !data.databaseConnected) {
        return
      }

      // Check if required tables exist
      const requiredTables = ["users", "data_sources", "reports"]
      const missingTables = requiredTables.filter(
        (table) => !data.databaseTables || !data.databaseTables.includes(table),
      )

      if (missingTables.length > 0) {
        setShowInitializer(true)
      } else {
        setShowInitializer(false)
      }
    } catch (error) {
      console.error("Error checking database status:", error)
    }
  }

  const initializeDatabase = async () => {
    try {
      setStatus("loading")
      setMessage("Initializing database...")

      const response = await fetch("/api/database/init", {
        method: "POST",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to initialize database: ${errorText}`)
      }

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Database initialized successfully!")
        setTimeout(() => {
          setShowInitializer(false)
        }, 3000)
      } else {
        throw new Error(data.error || "Unknown error initializing database")
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  if (!showInitializer) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Initialization
          </CardTitle>
          <CardDescription>Your database needs to be initialized with required tables</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <Alert variant="default" className="mb-4 border-green-500">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-muted-foreground">
            This will create all necessary tables and seed them with initial data. This operation is safe and won't
            affect existing data.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowInitializer(false)}>
            Skip
          </Button>
          <Button onClick={initializeDatabase} disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Initializing...
              </>
            ) : (
              "Initialize Database"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
