"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  Upload,
  Database,
  Code,
  Layers,
  Sparkles,
  Settings,
  Users,
  FileText,
  ChevronRight,
  ChevronLeft,
  BarChart,
  HardDrive,
  FolderOpen,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function Sidebar() {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setExpanded(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Import",
      href: "/import",
      icon: <Upload className="h-5 w-5" />,
    },
    {
      name: "Query Builder",
      href: "/query-builder",
      icon: <Database className="h-5 w-5" />,
    },
    {
      name: "SQL Editor",
      href: "/sql-editor",
      icon: <Code className="h-5 w-5" />,
    },
    {
      name: "Streaming",
      href: "/streaming",
      icon: <Layers className="h-5 w-5" />,
    },
    {
      name: "Spark",
      href: "/spark",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      name: "Data Management",
      icon: <FolderOpen className="h-5 w-5" />,
      children: [
        {
          name: "Data Sources",
          href: "/data-management/data-sources",
          icon: <Database className="h-4 w-4" />,
        },
        {
          name: "Storage",
          href: "/data-management/storage",
          icon: <HardDrive className="h-4 w-4" />,
        },
        {
          name: "Reports",
          href: "/data-management/reports",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
    {
      name: "Administration",
      icon: <Settings className="h-5 w-5" />,
      children: [
        {
          name: "Users",
          href: "/administration/users",
          icon: <Users className="h-4 w-4" />,
        },
        {
          name: "Analytics",
          href: "/administration/analytics",
          icon: <BarChart className="h-4 w-4" />,
        },
      ],
    },
  ]

  // Mobile sidebar overlay
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-3 z-50 lg:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileOpen(false)}>
            <div
              className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-950 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary p-1.5">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold gradient-text">EDP</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="py-4 px-2">
                {navItems.map((item, index) => {
                  if (item.children) {
                    return (
                      <Collapsible
                        key={item.name}
                        open={openGroups[item.name]}
                        onOpenChange={() => toggleGroup(item.name)}
                        className="mb-2"
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-between px-3 py-2 text-left font-medium",
                              openGroups[item.name] && "bg-muted",
                            )}
                          >
                            <div className="flex items-center">
                              {item.icon}
                              <span className="ml-3">{item.name}</span>
                            </div>
                            <ChevronRight
                              className={cn("h-4 w-4 transition-transform", openGroups[item.name] && "rotate-90")}
                            />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 space-y-1 pt-1">
                          {item.children.map((child) => {
                            const isActive = pathname === child.href
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                                )}
                              >
                                {child.icon}
                                <span>{child.name}</span>
                              </Link>
                            )
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    )
                  }

                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-1",
                        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Desktop sidebar
  return (
    <div
      className={cn(
        "hidden lg:flex flex-col border-r bg-white dark:bg-gray-950 shadow-sm transition-all duration-300",
        expanded ? "w-64" : "w-16",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary p-1.5">
            <Database className="h-5 w-5 text-white" />
          </div>
          {expanded && <h1 className="text-xl font-bold gradient-text">EDP</h1>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} className="h-8 w-8">
          {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <div className="py-4 px-2 flex-1 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item, index) => {
            if (item.children) {
              return expanded ? (
                <Collapsible
                  key={item.name}
                  open={openGroups[item.name]}
                  onOpenChange={() => toggleGroup(item.name)}
                  className="mb-2"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between px-3 py-2 text-left font-medium",
                        openGroups[item.name] && "bg-muted",
                      )}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </div>
                      <ChevronRight
                        className={cn("h-4 w-4 transition-transform", openGroups[item.name] && "rotate-90")}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-4 space-y-1 pt-1">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                          )}
                        >
                          {child.icon}
                          <span>{child.name}</span>
                        </Link>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <div key={item.name} className="mb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-center p-2"
                        onClick={() => toggleGroup(item.name)}
                      >
                        {item.icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.name}</TooltipContent>
                  </Tooltip>

                  {openGroups[item.name] && (
                    <div className="absolute left-16 top-0 z-50 w-48 bg-white dark:bg-gray-950 rounded-md shadow-lg border p-2 mt-2">
                      {item.children.map((child) => {
                        const isActive = pathname === child.href
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                              isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                            )}
                          >
                            {child.icon}
                            <span>{child.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            const isActive = pathname === item.href

            return expanded ? (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-1",
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ) : (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex justify-center items-center p-2 rounded-md mb-1",
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    {item.icon}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.name}</TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </div>

      <div className="p-4 border-t">
        <Button variant="outline" className={cn("w-full", !expanded && "justify-center p-2")}>
          <Settings className="h-4 w-4" />
          {expanded && <span className="ml-2">Settings</span>}
        </Button>
      </div>
    </div>
  )
}
