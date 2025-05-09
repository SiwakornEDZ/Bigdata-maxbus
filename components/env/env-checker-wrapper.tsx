"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { EnvChecker } from "@/components/env/env-checker"

export function EnvCheckerWrapper({ children }: { children: React.ReactNode }) {
  const [showChecker, setShowChecker] = useState(true)
  const [envChecked, setEnvChecked] = useState(false)

  useEffect(() => {
    // Check if we've already verified the environment in this session
    const envVerified = sessionStorage.getItem("envVerified")
    if (envVerified === "true") {
      setShowChecker(false)
      setEnvChecked(true)
    }

    // After 5 seconds, hide the checker and show the children regardless
    const timer = setTimeout(() => {
      setShowChecker(false)
      setEnvChecked(true)
      sessionStorage.setItem("envVerified", "true")
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if (!envChecked) {
    return showChecker ? <EnvChecker /> : null
  }

  return <>{children}</>
}
