"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Upload, Database, Code } from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()

  const bottomNavItems = [
    {
      name: "Home",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Import",
      href: "/import",
      icon: <Upload className="h-5 w-5" />,
    },
    {
      name: "Query",
      href: "/query-builder",
      icon: <Database className="h-5 w-5" />,
    },
    {
      name: "SQL",
      href: "/sql-editor",
      icon: <Code className="h-5 w-5" />,
    },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-950 border-t shadow-lg">
      <div className="grid grid-cols-4 gap-1 p-2">
        {bottomNavItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center rounded-md p-2 text-xs font-medium",
              pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.icon}
            <span className="mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
