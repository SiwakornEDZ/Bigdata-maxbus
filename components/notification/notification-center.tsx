"use client"

import { useState } from "react"
import { useNotification } from "@/components/notification/notification-provider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Bell, CheckCheck, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface NotificationCenterProps {
  onClose: () => void
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotification()
  const [activeTab, setActiveTab] = useState("all")

  const unreadNotifications = notifications.filter((notification) => !notification.read)
  const readNotifications = notifications.filter((notification) => notification.read)

  const displayNotifications =
    activeTab === "all" ? notifications : activeTab === "unread" ? unreadNotifications : readNotifications

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 dark:bg-green-900/20"
      case "error":
        return "bg-red-100 dark:bg-red-900/20"
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900/20"
      default:
        return "bg-blue-100 dark:bg-blue-900/20"
    }
  }

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-500"
      case "error":
        return "text-red-500"
      case "warning":
        return "text-yellow-500"
      default:
        return "text-blue-500"
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <div className="flex items-center gap-2">
          {unreadNotifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Unread ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="read" className="flex-1">
              Read ({readNotifications.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {displayNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No notifications to display</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {displayNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.read ? "opacity-70" : ""
                    } ${getNotificationBgColor(notification.type)}`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className={`font-medium ${getNotificationIconColor(notification.type)}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCheck className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeNotification(notification.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {notifications.length > 0 && (
        <div className="p-4 border-t">
          <Button variant="outline" size="sm" className="w-full" onClick={clearAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear all notifications
          </Button>
        </div>
      )}
    </div>
  )
}
