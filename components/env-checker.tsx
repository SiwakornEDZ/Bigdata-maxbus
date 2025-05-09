"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EnvChecker() {
  const [envStatus, setEnvStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkEnvironment = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Checking environment...")

      const response = await fetch("/api/check-env", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      console.log("Environment check response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log("Environment check data:", data)

      if (!data) {
        throw new Error("No data returned from environment check")
      }

      if (data.error) {
        throw new Error(data.error)
      }

      setEnvStatus(data)
    } catch (err) {
      console.error("Error checking environment:", err)
      setError(err?.message || "Unknown error checking environment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkEnvironment()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Checking environment setup...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={checkEnvironment} className="mt-4" variant="outline" size="sm">
          Try Again
        </Button>
      </Alert>
    )
  }

  if (!envStatus) {
    return null
  }

  // If everything is configured correctly, don't show anything
  if (envStatus.envVars.DATABASE_URL && envStatus.databaseConnected) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-700">Environment Setup Complete</AlertTitle>
        <AlertDescription className="text-green-600">
          All required environment variables are properly configured.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {!envStatus.envVars.DATABASE_URL && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing DATABASE_URL</AlertTitle>
          <AlertDescription>
            The DATABASE_URL environment variable is not set. Please add it to your environment variables.
          </AlertDescription>
        </Alert>
      )}

      {envStatus.envVars.DATABASE_URL && !envStatus.databaseConnected && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Connection Failed</AlertTitle>
          <AlertDescription>
            {envStatus.databaseError || "Could not connect to the database. Please check your connection string."}
          </AlertDescription>
        </Alert>
      )}

      {!envStatus.envVars.JWT_SECRET && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing JWT_SECRET</AlertTitle>
          <AlertDescription>
            The JWT_SECRET environment variable is not set. A default value is being used, which is not secure for
            production.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
