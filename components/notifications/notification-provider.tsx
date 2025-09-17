"use client"

import type React from "react"

import { createContext, useContext, useEffect } from "react"
import { useNotifications } from "@/hooks/use-notifications"

interface NotificationContextType {
  isConnected: boolean
  showNotification: (type: string, data: any) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, showNotification } = useNotifications()

  useEffect(() => {
    const handleNotificationEvent = (event: CustomEvent) => {
      showNotification(event.detail.type, event.detail.data)
    }

    window.addEventListener("civiccare-notification", handleNotificationEvent as EventListener)

    return () => {
      window.removeEventListener("civiccare-notification", handleNotificationEvent as EventListener)
    }
  }, [showNotification])

  return (
    <NotificationContext.Provider value={{ isConnected, showNotification }}>{children}</NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotificationContext must be used within a NotificationProvider")
  }
  return context
}
