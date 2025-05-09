"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean // Changed from 'loading' to 'isLoading'
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Changed from 'loading' to 'isLoading'
  const router = useRouter()
  const { toast } = useToast()

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Don't check auth on login or register pages
        if (
          typeof window !== "undefined" &&
          (window.location.pathname === "/login" || window.location.pathname === "/register")
        ) {
          setIsLoading(false) // Changed from 'setLoading' to 'setIsLoading'
          return
        }

        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setIsLoading(false) // Changed from 'setLoading' to 'setIsLoading'
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true) // Changed from 'setLoading' to 'setIsLoading'
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.message || "Invalid credentials",
        })
        return false
      }

      setUser(data.user)

      // Navigate to dashboard after successful login
      router.push("/")
      return true
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Login error",
        description: error.message || "An unexpected error occurred. Please try again.",
      })
      return false
    } finally {
      setIsLoading(false) // Changed from 'setLoading' to 'setIsLoading'
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true) // Changed from 'setLoading' to 'setIsLoading'
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Logout failed")
      }

      setUser(null)
      router.push("/login")

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    } catch (error: any) {
      console.error("Logout error:", error)
      toast({
        variant: "destructive",
        title: "Logout error",
        description: error.message || "An error occurred during logout.",
      })
    } finally {
      setIsLoading(false) // Changed from 'setLoading' to 'setIsLoading'
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true) // Changed from 'setLoading' to 'setIsLoading'
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      })

      const data = await res.json()

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: data.message || "Could not create account",
        })
        return false
      }

      setUser(data.user)
      router.push("/")
      return true
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        variant: "destructive",
        title: "Registration error",
        description: error.message || "An unexpected error occurred. Please try again.",
      })
      return false
    } finally {
      setIsLoading(false) // Changed from 'setLoading' to 'setIsLoading'
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
