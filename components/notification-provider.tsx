"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"

type NotificationType = "success" | "error" | "info" | "warning"

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (type: NotificationType, title: string, message: string) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (type: NotificationType, title: string, message: string) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification = {
      id,
      type,
      title,
      message,
      timestamp: new Date(),
    }

    setNotifications((prev) => [...prev, newNotification])

    // Also show a toast
    toast({
      title,
      description: message,
      variant: type === "error" ? "destructive" : "default",
    })

    return id
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  // Global error handler
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      addNotification("error", "Application Error", `${event.message} (in ${event.filename}:${event.lineno})`)
    }

    const handleRejection = (event: PromiseRejectionEvent) => {
      addNotification("error", "Promise Rejection", event.reason?.message || "An async operation failed")
    }

    window.addEventListener("error", handleGlobalError)
    window.addEventListener("unhandledrejection", handleRejection)

    return () => {
      window.removeEventListener("error", handleGlobalError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
