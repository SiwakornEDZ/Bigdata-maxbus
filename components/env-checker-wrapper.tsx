"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { EnvChecker } from "./env-checker"
import { usePathname } from "next/navigation"

export function EnvCheckerWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [showEnvChecker, setShowEnvChecker] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Only show environment checker on login and register pages
  const isAuthPage = pathname === "/login" || pathname === "/register"

  useEffect(() => {
    if (!isAuthPage) {
      setIsLoading(false)
      return
    }

    const checkEnv = async () => {
      try {
        // Add a cache-busting query parameter
        const timestamp = new Date().getTime()
        const res = await fetch(`/api/check-env?t=${timestamp}`, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        if (!res.ok) {
          console.error("Failed to check environment:", res.status)
          setShowEnvChecker(true) // Show checker on error to allow manual setup
          return
        }

        // Check if response is JSON
        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Non-JSON response received")
          setShowEnvChecker(true) // Show checker on error to allow manual setup
          return
        }

        const data = await res.json()

        // If database is not connected or any required env variable is missing, show the env checker
        if (!data.success || !data.databaseConnected || data.missingVars?.length > 0) {
          setShowEnvChecker(true)
        } else {
          setShowEnvChecker(false)
        }
      } catch (error) {
        console.error("Failed to check environment:", error)
        setShowEnvChecker(true) // Show checker on error to allow manual setup
      } finally {
        setIsLoading(false)
      }
    }

    checkEnv()
  }, [isAuthPage])

  if (isLoading && isAuthPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading environment...</p>
        </div>
      </div>
    )
  }

  if (showEnvChecker && isAuthPage) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <EnvChecker />
      </div>
    )
  }

  return <>{children}</>
}

