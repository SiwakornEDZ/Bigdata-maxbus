"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"

export function EnvChecker() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("")
  const [details, setDetails] = useState<Record<string, boolean>>({})

  const checkEnvironment = async () => {
    try {
      setStatus("loading")
      const response = await fetch("/api/check-env")

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error checking environment: ${errorText}`)
      }

      const data = await response.json()

      if (data.error) {
        setStatus("error")
        setMessage(data.error)
        return
      }

      setDetails({
        databaseConnected: data.databaseConnected || false,
        requiredTablesExist: data.databaseTables
          ? data.databaseTables.includes("users") && data.databaseTables.includes("data_sources")
          : false,
      })

      if (data.databaseConnected) {
        setStatus("success")
        setMessage("Environment is properly configured")
      } else {
        setStatus("error")
        setMessage("Some environment variables are missing or invalid")
      }
    } catch (err) {
      setStatus("error")
      setMessage(`Error checking environment: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  useEffect(() => {
    checkEnvironment()
  }, [])

  if (status === "loading") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Checking Environment</CardTitle>
          <CardDescription>Verifying your environment configuration...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-md mx-auto border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Environment Configuration Error
          </CardTitle>
          <CardDescription>There are issues with your environment setup</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className={details.databaseConnected ? "text-green-500" : "text-red-500"}>
                {details.databaseConnected ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              </div>
              <span>Database Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={details.requiredTablesExist ? "text-green-500" : "text-red-500"}>
                {details.requiredTablesExist ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              </div>
              <span>Required Database Tables</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={checkEnvironment} className="w-full">
            Retry
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto border-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-500">
          <CheckCircle2 className="h-5 w-5" />
          Environment Configured
        </CardTitle>
        <CardDescription>Your environment is properly set up</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Database Connection</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Required Database Tables</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
