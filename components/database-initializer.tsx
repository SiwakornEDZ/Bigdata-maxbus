"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function DatabaseInitializer() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [envStatus, setEnvStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const initializeDatabase = async () => {
    try {
      setIsInitializing(true)
      setError(null)

      const response = await fetch("/api/database/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error: ${response.status} ${errorText}`)
      }

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}...`)
      }

      const data = await response.json()

      if (data.success) {
        setIsInitialized(true)
        setShowDialog(false)
        toast({
          title: "Success",
          description: "Database initialized successfully",
        })
      } else {
        console.error("Database initialization failed:", data.message)
        setError(data.message || "An error occurred during database initialization")
        toast({
          variant: "destructive",
          title: "Database Initialization Failed",
          description: data.message || "An error occurred during database initialization",
        })
      }
    } catch (error) {
      console.error("Error initializing database:", error)
      setError(error.message || "Failed to initialize database")
      toast({
        variant: "destructive",
        title: "Database Error",
        description: error.message || "Failed to initialize database. Please check your connection.",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  // Check if the database is already initialized
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Add a cache-busting query parameter to prevent caching
        const timestamp = new Date().getTime()

        try {
          const response = await fetch(`/api/check-env?t=${timestamp}`, {
            method: "GET",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
            credentials: "include",
          })

          if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`)
          }

          // Check if response is JSON
          const contentType = response.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text()
            console.error("Non-JSON response received:", text.substring(0, 100))
            throw new Error("Server returned non-JSON response. You may need to log in first.")
          }

          const data = await response.json()
          setEnvStatus(data)

          // ตรวจสอบว่า data มีค่าและมี databaseConnected ก่อนใช้งาน
          if (data && typeof data.databaseConnected !== "undefined") {
            if (data.databaseConnected) {
              // Check if users table exists
              if (data.databaseTables && data.databaseTables.includes("users")) {
                setIsInitialized(true)
                setShowDialog(false)
              } else {
                setShowDialog(true)
              }
            } else {
              setError(data.databaseError || "Database connection failed")
              setShowDialog(true)
            }
          } else {
            // กรณีที่ไม่มีข้อมูลเกี่ยวกับการเชื่อมต่อฐานข้อมูล
            setError("Could not determine database connection status")
            setShowDialog(true)
          }
        } catch (fetchError) {
          console.error("Fetch error in checkDatabase:", fetchError)
          setError(`Failed to check database status: ${fetchError.message}`)
          setShowDialog(true)
        }
      } catch (error) {
        console.error("Failed to check database:", error)
        setError(error.message || "Failed to check database status")
        setShowDialog(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkDatabase()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Checking database connection...</span>
      </div>
    )
  }

  if (!showDialog) {
    return null
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Database Setup Required</DialogTitle>
          <DialogDescription>
            The database tables need to be initialized before you can use the application.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {envStatus && !envStatus.envVars.DATABASE_URL && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Missing DATABASE_URL</AlertTitle>
            <AlertDescription>
              The DATABASE_URL environment variable is not set. Please add it to your environment variables.
            </AlertDescription>
          </Alert>
        )}

        <p className="text-sm text-muted-foreground">
          This will create the necessary tables and sample data for the application to function properly.
        </p>

        <DialogFooter>
          <Button
            onClick={initializeDatabase}
            disabled={isInitializing || (envStatus && !envStatus.envVars.DATABASE_URL)}
          >
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              "Initialize Database"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
