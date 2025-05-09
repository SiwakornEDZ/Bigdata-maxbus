import type { ReactNode } from "react"
import { Sidebar } from "@/components/sidebar"
import { UserNav } from "@/components/user-nav"
import { NotificationCenter } from "@/components/notification-center"
import { Database } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-40 border-b bg-white dark:bg-gray-950 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2 md:hidden">
              <div className="rounded-lg bg-primary p-1.5">
                <Database className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold gradient-text">EDP</h1>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <NotificationCenter />
              <UserNav />
            </div>
          </div>
          <MobileNav />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        <footer className="border-t py-4 bg-white dark:bg-gray-950 px-4 md:px-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2025 Enterprise Data Platform</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

