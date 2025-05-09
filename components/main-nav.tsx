"use client"

import { ThemeToggle } from "@/components/theme-toggle"

export function MainNav() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
    </div>
  ) // We're using the sidebar instead
}

