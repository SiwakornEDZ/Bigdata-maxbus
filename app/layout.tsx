import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-context"
import { DatabaseInitializer } from "@/components/database-initializer"
import { NotificationProvider } from "@/components/notification-provider"
import { EnvCheckerWrapper } from "@/components/env-checker-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Enterprise Data Platform",
  description: "A comprehensive platform for managing enterprise data",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <NotificationProvider>
              <EnvCheckerWrapper>{children}</EnvCheckerWrapper>
              <DatabaseInitializer />
              <Toaster />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

