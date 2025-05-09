"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type { User, UserCredentials, UserRegistration, AuthResult } from "@/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: UserCredentials) => Promise<AuthResult>
  register: (data: UserRegistration) => Promise<AuthResult>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch current user
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/me")

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check authentication status on mount
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Login function
  const login = async (credentials: UserCredentials): Promise<AuthResult> => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      const result: AuthResult = await response.json()

      if (response.ok && result.success && result.user) {
        setUser(result.user)
        setIsAuthenticated(true)

        toast({
          title: "Login successful",
          description: "Welcome back!",
        })

        router.push("/")
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: result.message || "Invalid credentials",
        })
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"

      toast({
        variant: "destructive",
        title: "Login error",
        description: errorMessage,
      })

      return {
        success: false,
        message: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (data: UserRegistration): Promise<AuthResult> => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result: AuthResult = await response.json()

      if (response.ok && result.success && result.user) {
        setUser(result.user)
        setIsAuthenticated(true)

        toast({
          title: "Registration successful",
          description: "Your account has been created",
        })

        router.push("/")
      } else {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: result.message || "Could not create account",
        })
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"

      toast({
        variant: "destructive",
        title: "Registration error",
        description: errorMessage,
      })

      return {
        success: false,
        message: errorMessage,
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    setIsLoading(true)

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      setUser(null)
      setIsAuthenticated(false)

      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      })

      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)

      toast({
        variant: "destructive",
        title: "Logout error",
        description: "An error occurred during logout",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
