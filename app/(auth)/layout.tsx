import type React from "react"
import { AuthProvider } from "@/components/auth-context"
import { Toaster } from "@/components/ui/toaster"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </div>
  )
}

